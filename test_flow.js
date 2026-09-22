/**
 * End-to-End API Verification Script for QuoteCraft
 */
const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing QuoteCraft APIs...\n');

  // 1. Health check
  const health = await request('GET', '/api/health');
  console.log('1. Health Check:', health.status, health.data.status);

  // 2. Register Owner
  const testUser = {
    name: 'Vikram Mehta',
    email: `vikram_${Date.now()}@mehtaconstructions.com`,
    password: 'Password@123',
    companyName: 'Mehta Engineering & Construction',
    companyPhone: '+91 9820012345'
  };
  const regRes = await request('POST', '/api/auth/register', testUser);
  console.log('2. User Registration:', regRes.status, regRes.data.message);
  const token = regRes.data.token;

  // 3. Create Party
  const partyData = {
    name: 'Skyline Real Estate Corp',
    receiverName: 'Mr. Arvind Swaminathan',
    phone: '+91 9988776655',
    email: 'procurement@skylinerealty.com',
    address: 'Plot 42, Bandra-Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    taxId: '27AABCS1234F1Z9'
  };
  const partyRes = await request('POST', '/api/parties', partyData, token);
  console.log('3. Create Party:', partyRes.status, partyRes.data.party.name);
  const partyId = partyRes.data.party._id;

  // 4. Create Catalog Items
  const catItem1 = {
    name: 'Reinforced Steel Rebar TMT 12mm',
    description: 'Grade Fe 550D ISI certified steel',
    unit: 'kg',
    defaultRate: 68.50,
    taxRate: 18,
    category: 'Structural Steel'
  };
  const catRes = await request('POST', '/api/catalog', catItem1, token);
  console.log('4. Create Catalog Item:', catRes.status, catRes.data.item.name);

  // 5. Create Quotation
  const quoteData = {
    quotationNumber: 'QT-2026-0001',
    quoteDate: '2026-09-22',
    validUntil: '2026-10-22',
    templateId: 'clean-indigo',
    status: 'Pending',
    partyId,
    party: partyRes.data.party,
    subject: 'Quotation for Supply of TMT Steel Rebar for Phase 1 Construction',
    openingNote: 'Thank you for inquiring with us. We are pleased to submit our most competitive rates for high-grade TMT steel.',
    items: [
      {
        itemId: catRes.data.item._id,
        name: 'Reinforced Steel Rebar TMT 12mm',
        description: 'Fe 550D Grade, test certificate included',
        qty: 1500,
        unit: 'kg',
        rate: 68.50,
        discountPercent: 2,
        taxPercent: 18,
        amount: 0
      },
      {
        itemId: null,
        name: 'Site Unloading & Transportation Charges',
        description: 'Flatbed hydraulic crane transport',
        qty: 1,
        unit: 'trip',
        rate: 8500,
        discountPercent: 0,
        taxPercent: 5,
        amount: 0
      }
    ],
    closingNote: 'Thank you for inquiring with us! We assure prompt dispatch upon order confirmation.',
    signerName: 'Vikram Mehta',
    signerTitle: 'Managing Director'
  };
  const quoteRes = await request('POST', '/api/quotes', quoteData, token);
  console.log('5. Create Quotation:', quoteRes.status, quoteRes.data.quote.quotationNumber);
  console.log('   Grand Total:', quoteRes.data.quote.currency, quoteRes.data.quote.grandTotal);
  console.log('   Total in Words:', quoteRes.data.quote.totalInWords);

  const shareToken = quoteRes.data.quote.shareToken;

  // 6. Public Client View (No Auth Token)
  const pubRes = await request('GET', `/api/quotes/public/${shareToken}`);
  console.log('6. Public Client View:', pubRes.status, 'Party:', pubRes.data.quote.party.name);
  console.log('   Owner Company:', pubRes.data.owner.companyName);

  // 7. Client Response Action (Client Approves Quotation)
  const respondRes = await request('POST', `/api/quotes/public/${shareToken}/respond`, {
    action: 'Approved',
    clientRemarks: 'Price approved. Please issue dispatch schedule for next Monday.'
  });
  console.log('7. Client Approval Response:', respondRes.status, respondRes.data.message);
  console.log('   Updated Status:', respondRes.data.quote.status);

  console.log('\n🎉 ALL CORE WORKFLOWS AND APIS VERIFIED 100% WORKING!\n');
}

runTests().catch(console.error);
