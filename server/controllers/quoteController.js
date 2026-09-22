/**
 * ============================================================================
 * Quotation Controller
 * ============================================================================
 * Manages full lifecycle of quotations: creation, updates, status transitions,
 * dynamic calculations (subtotal, taxes, discounts, words representation),
 * template preferences, public client viewing, and client approval/rejection.
 */

const Quotation = require('../models/Quotation');
const User = require('../models/User');
const { numberToWords } = require('../utils/numberToWords');
const { generateQuoteNum } = require('../utils/generateQuoteNum');
const { enrichUserPlan } = require('./authController');

/**
 * Calculate totals and line amounts safely
 */
function calculateQuoteAmounts(items = [], currencyCode = 'INR') {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const processedItems = items.map(item => {
    const qty = Math.max(0, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
    const taxPercent = Math.max(0, Number(item.taxPercent) || 0);

    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * discountPercent) / 100;
    const amountAfterDiscount = baseAmount - discountAmount;
    const taxAmount = (amountAfterDiscount * taxPercent) / 100;
    // GST is only added in the final summary box (grandTotal), not in individual line item amount
    const lineTotal = amountAfterDiscount;

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    return {
      ...item,
      qty,
      rate,
      discountPercent,
      taxPercent,
      amount: Number(lineTotal.toFixed(2))
    };
  });

  const grandTotal = Number((subtotal - totalDiscount + totalTax).toFixed(2));
  const totalInWords = numberToWords(grandTotal, currencyCode);

  return {
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal,
    totalInWords
  };
}

/**
 * Get all quotations for the user with optional filters
 * GET /api/quotes
 */
exports.getAllQuotes = async (req, res) => {
  try {
    const { status, search } = req.query;
    let quotes = await Quotation.find({ userId: req.user.id });

    // Filter by status if requested
    if (status && status !== 'All') {
      quotes = quotes.filter(q => q.status === status);
    }

    // Filter by search query (quotationNumber, party name, receiver, subject)
    if (search) {
      const q = search.toLowerCase();
      quotes = quotes.filter(item => 
        (item.quotationNumber && item.quotationNumber.toLowerCase().includes(q)) ||
        (item.party && item.party.name && item.party.name.toLowerCase().includes(q)) ||
        (item.party && item.party.receiverName && item.party.receiverName.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    quotes.sort((a, b) => new Date(b.createdAt || b.quoteDate) - new Date(a.createdAt || a.quoteDate));

    res.status(200).json({
      success: true,
      count: quotes.length,
      quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quotations.'
    });
  }
};

/**
 * Get a single quotation by ID
 * GET /api/quotes/:id
 */
exports.getQuoteById = async (req, res) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote || quote.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found or unauthorized.'
      });
    }

    res.status(200).json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quotation.'
    });
  }
};

/**
 * Create a new quotation
 * POST /api/quotes
 */
exports.createQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const enriched = enrichUserPlan({ ...user });
    if (enriched && enriched.isPlanDue) {
      return res.status(403).json({
        success: false,
        message: 'Quotation drafting is locked because your plan has expired. Please renew your subscription to create new quotes.'
      });
    }

    const {
      quotationNumber: customQuoteNum,
      quoteDate,
      validUntil,
      partyId,
      party,
      subject,
      openingNote,
      items = [],
      templateId,
      accentColor,
      status = 'Pending',
      notes,
      termsAndConditions,
      remarks,
      closingNote,
      signatureType,
      signatureData,
      signerName,
      signerTitle,
      currency,
      currencyCode
    } = req.body;

    if (!party || !party.name) {
      return res.status(400).json({
        success: false,
        message: 'Party / Client information is required.'
      });
    }

    // Determine quotation number
    let finalQuoteNumber = customQuoteNum;
    if (!finalQuoteNumber) {
      const count = await Quotation.countDocuments({ userId });
      finalQuoteNumber = generateQuoteNum(count);
    }

    const curCode = currencyCode || (user ? user.currencyCode : 'INR');
    const curSymbol = currency || (user ? user.currency : '₹');

    // Calculate amounts and amount in words
    const calculated = calculateQuoteAmounts(items, curCode);

    const newQuotation = await Quotation.create({
      userId,
      quotationNumber: finalQuoteNumber,
      quoteDate: quoteDate || new Date().toISOString().split('T')[0],
      validUntil: validUntil || '',
      partyId: partyId || null,
      party: {
        name: party.name.trim(),
        receiverName: party.receiverName ? party.receiverName.trim() : '',
        address: party.address || '',
        city: party.city || '',
        state: party.state || '',
        pincode: party.pincode || '',
        phone: party.phone || '',
        email: party.email || '',
        taxId: party.taxId || ''
      },
      subject: subject || 'Quotation for Supply and Services',
      openingNote: openingNote || 'Thank you for inquiring with us. We are pleased to submit our quotation as requested.',
      items: calculated.items,
      subtotal: calculated.subtotal,
      totalDiscount: calculated.totalDiscount,
      totalTax: calculated.totalTax,
      grandTotal: calculated.grandTotal,
      totalInWords: calculated.totalInWords,
      currency: curSymbol,
      currencyCode: curCode,
      templateId: templateId || 'modern-minimal',
      accentColor: accentColor || '#2563eb',
      status: status || 'Pending',
      statusHistory: [{
        status: status || 'Pending',
        timestamp: new Date().toISOString(),
        note: 'Quotation created'
      }],
      notes: notes !== undefined ? notes : (user ? user.defaultNotes : ''),
      termsAndConditions: termsAndConditions !== undefined ? termsAndConditions : (user ? user.defaultTerms : ''),
      remarks: remarks || '',
      closingNote: closingNote || 'Thank you for inquiring with us! We look forward to your positive response.',
      signatureType: signatureType || 'owner_default',
      signatureData: signatureData || (user ? user.signatureUrl : ''),
      signerName: signerName || (user ? user.name : ''),
      signerTitle: signerTitle || 'Authorized Signatory',
      shareToken: Math.random().toString(36).substring(2) + Date.now().toString(36)
    });

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully!',
      quote: newQuotation
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quotation.'
    });
  }
};

/**
 * Update an existing quotation
 * PUT /api/quotes/:id
 */
exports.updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Quotation.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found or unauthorized.'
      });
    }

    const user = await User.findById(req.user.id);
    const enriched = enrichUserPlan({ ...user });
    if (enriched && enriched.isPlanDue) {
      return res.status(403).json({
        success: false,
        message: 'Quotation editing is locked because your plan has expired. Please renew your subscription to make changes.'
      });
    }

    const curCode = req.body.currencyCode || existing.currencyCode || 'INR';
    const items = req.body.items || existing.items || [];
    const calculated = calculateQuoteAmounts(items, curCode);

    const updates = {
      ...req.body,
      items: calculated.items,
      subtotal: calculated.subtotal,
      totalDiscount: calculated.totalDiscount,
      totalTax: calculated.totalTax,
      grandTotal: calculated.grandTotal,
      totalInWords: calculated.totalInWords
    };

    // If status changed in update, append to status history
    if (req.body.status && req.body.status !== existing.status) {
      const history = existing.statusHistory || [];
      history.push({
        status: req.body.status,
        timestamp: new Date().toISOString(),
        note: req.body.statusNote || `Status updated to ${req.body.status}`
      });
      updates.statusHistory = history;
    }

    const updated = await Quotation.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully!',
      quote: updated
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quotation.'
    });
  }
};

/**
 * Update only quotation status (e.g. In Process, Approved, Rejected)
 * PATCH /api/quotes/:id/status
 */
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Draft', 'Pending', 'In Process', 'Approved', 'Rejected', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const existing = await Quotation.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found or unauthorized.'
      });
    }

    const history = existing.statusHistory || [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status changed to ${status}`
    });

    const updated = await Quotation.findByIdAndUpdate(
      id,
      { status, statusHistory: history },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Quotation status marked as ${status}!`,
      quote: updated
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quotation status.'
    });
  }
};

/**
 * Delete a quotation
 * DELETE /api/quotes/:id
 */
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Quotation.findById(id);

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found or unauthorized.'
      });
    }

    await Quotation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quotation.'
    });
  }
};

/**
 * Public Client View of a quotation (via shareToken or ID)
 * GET /api/quotes/public/:shareToken
 */
exports.getPublicQuote = async (req, res) => {
  try {
    const { shareToken } = req.params;
    // Find by shareToken or _id
    let quote = await Quotation.findOne({ shareToken });
    if (!quote) {
      quote = await Quotation.findById(shareToken);
    }

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found or link has expired.'
      });
    }

    // Also fetch owner business info for template rendering
    const owner = await User.findById(quote.userId);
    const ownerInfo = owner ? {
      name: owner.name,
      companyName: owner.companyName,
      companyPhone: owner.companyPhone,
      companyEmail: owner.companyEmail,
      companyAddress: owner.companyAddress,
      companyCity: owner.companyCity,
      companyState: owner.companyState,
      companyPincode: owner.companyPincode,
      companySubtitle: owner.companySubtitle || '',
      companyFactoryAddress: owner.companyFactoryAddress || '',
      taxId: owner.taxId,
      panNo: owner.panNo || '',
      logoUrl: owner.logoUrl,
      signatureUrl: owner.signatureUrl,
      bankDetails: owner.bankDetails
    } : {};

    res.status(200).json({
      success: true,
      quote,
      owner: ownerInfo
    });
  } catch (error) {
    console.error('Error fetching public quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quotation details.'
    });
  }
};

/**
 * Client response action (Client approves or rejects quote from public view)
 * POST /api/quotes/public/:shareToken/respond
 */
exports.clientRespondQuote = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { action, clientRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be Approved or Rejected.'
      });
    }

    let quote = await Quotation.findOne({ shareToken });
    if (!quote) {
      quote = await Quotation.findById(shareToken);
    }

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.'
      });
    }

    const history = quote.statusHistory || [];
    history.push({
      status: action,
      timestamp: new Date().toISOString(),
      note: `Client marked as ${action}. Remarks: ${clientRemarks || 'None'}`
    });

    const updated = await Quotation.findByIdAndUpdate(
      quote._id,
      {
        status: action,
        clientFeedback: {
          action,
          clientRemarks: clientRemarks || '',
          responseDate: new Date().toISOString()
        },
        statusHistory: history
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Thank you! Your response (${action}) has been submitted to the supplier.`,
      quote: updated
    });
  } catch (error) {
    console.error('Error in client response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response.'
    });
  }
};
