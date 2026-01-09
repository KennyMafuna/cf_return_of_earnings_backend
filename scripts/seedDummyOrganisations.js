require('dotenv').config();
const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  organisationType: String,
  registrationNumber: String,
  identityNumber: Array,
  taxNumber: String,
  organisationDetails: {
    ownershipType: String,
    tradingName: String,
    firstEmployeeDate: Date,
    address: {
      street: {
        number: String,
        name: String,
        suburb: String,
        city: String,
        province: String,
        postalCode: String
      },
      postal: mongoose.Schema.Types.Mixed
    },
    contact: {
      person: String,
      telephone: String,
      cellphone: String,
      email: String
    },
    banking: {
      bankName: String,
      accountHolder: String,
      accountNumber: String,
      branchCode: String
    },
    businessInfo: {
      numberOfEmployees: Number,
      industries: [String]
    }
  }
});

const Organisation = mongoose.model('Organisation', organisationSchema);
const ReturnOfEarnings = require('../models/ReturnOfEarnings');

const seedOrganisations = [
  {
    organisationType: "Company Registration Number",
    registrationNumber: "2013 / 058921 / 07",
    identityNumber: ["9607055592088", "9607055592089"],
    taxNumber: "1234567801",
    organisationDetails: {
      ownershipType: "PTY/LTD",
      tradingName: "Atisa Software Solutions",
      firstEmployeeDate: new Date("2025-11-18T00:00:00Z"),
      address: {
        street: {
          number: "4th Floor at Podium At Menlyn",
          name: "43 Ingersol Road",
          suburb: "Cnr. Lois and Atterbury Road",
          city: "Menlyn, Pretoria",
          province: "Gauteng",
          postalCode: "0181"
        },
        postal: null
      },
      contact: {
        person: "Kenny Mafuna",
        telephone: "0719080400",
        cellphone: "0719080400",
        email: "kennymafuna321@gmail.com"
      },
      banking: {
        bankName: "First National Bank",
        accountHolder: "Kabelo Mogwetsi",
        accountNumber: "1234567897897",
        branchCode: "00101"
      },
      businessInfo: {
        numberOfEmployees: 10,
        industries: ["2210"]
      }
    }
  },
  {
    organisationType: "Company Registration Number",
    registrationNumber: "2014 / 058922 / 08",
    identityNumber: ["9607055592089"],
    taxNumber: "8765432101",
    organisationDetails: {
      ownershipType: "PTY/LTD",
      tradingName: "ByteCraft Innovations",
      firstEmployeeDate: new Date("2023-05-10T00:00:00Z"),
      address: {
        street: {
          number: "22209",
          name: "Green Park",
          suburb: "Hillview",
          city: "Cape Town",
          province: "Western Cape",
          postalCode: "8001"
        },
        postal: null
      },
      contact: {
        person: "Alice Johnson",
        telephone: "0219081234",
        cellphone: "0821234567",
        email: "kmafuna021@student.wethinkcode.co.za"
      },
      banking: {
        bankName: "Standard Bank",
        accountHolder: "Alice Johnson",
        accountNumber: "9876543210987",
        branchCode: "00202"
      },
      businessInfo: {
        numberOfEmployees: 25,
        industries: ["3350"]
      }
    }
  },
  {
    organisationType: "Company Registration Number",
    registrationNumber: "2015 / 058923 / 09",
    identityNumber: ["9607055592090"],
    taxNumber: "1122334401",
    organisationDetails: {
      ownershipType: "PTY/LTD",
      tradingName: "NextGen Solutions",
      firstEmployeeDate: new Date("2021-07-22T00:00:00Z"),
      address: {
        street: {
          number: "33310",
          name: "Sunset Blvd",
          suburb: "Sunnyside",
          city: "Durban",
          province: "KwaZulu-Natal",
          postalCode: "4001"
        },
        postal: null
      },
      contact: {
        person: "Michael Smith",
        telephone: "0319085678",
        cellphone: "0835678910",
        email: "kmafuna021@student.wethinkcode.co.za"
      },
      banking: {
        bankName: "ABSA Bank",
        accountHolder: "Michael Smith",
        accountNumber: "5566778899001",
        branchCode: "00303"
      },
      businessInfo: {
        numberOfEmployees: 15,
        industries: ["4410"]
      }
    }
  },
  {
    organisationType: "Company Registration Number",
    registrationNumber: "2016 / 058924 / 10",
    identityNumber: ["9607055592091"],
    taxNumber: "2233445501",
    organisationDetails: {
      ownershipType: "PTY/LTD",
      tradingName: "Innovatech Labs",
      firstEmployeeDate: new Date("2022-03-15T00:00:00Z"),
      address: {
        street: {
          number: "44411",
          name: "Tech Park",
          suburb: "Midtown",
          city: "Pretoria",
          province: "Gauteng",
          postalCode: "0001"
        },
        postal: null
      },
      contact: {
        person: "Sophie Turner",
        telephone: "0129083456",
        cellphone: "0841234567",
        email: "kmafuna021@student.wethinkcode.co.za"
      },
      banking: {
        bankName: "Nedbank",
        accountHolder: "Sophie Turner",
        accountNumber: "6677889900112",
        branchCode: "00404"
      },
      businessInfo: {
        numberOfEmployees: 18,
        industries: ["5540"]
      }
    }
  },
  {
    organisationType: "Company Registration Number",
    registrationNumber: "2017 / 058925 / 11",
    identityNumber: ["9607055592092"],
    taxNumber: "3344556601",
    organisationDetails: {
      ownershipType: "PTY/LTD",
      tradingName: "CyberWorks",
      firstEmployeeDate: new Date("2020-01-05T00:00:00Z"),
      address: {
        street: {
          number: "55512",
          name: "Cyber Street",
          suburb: "Techville",
          city: "Johannesburg",
          province: "Gauteng",
          postalCode: "2001"
        },
        postal: null
      },
      contact: {
        person: "David Lee",
        telephone: "0119088765",
        cellphone: "0858765432",
        email: "kmafuna021@student.wethinkcode.co.za"
      },
      banking: {
        bankName: "Capitec Bank",
        accountHolder: "David Lee",
        accountNumber: "7788990011223",
        branchCode: "00505"
      },
      businessInfo: {
        numberOfEmployees: 12,
        industries: ["6670"]
      }
    }
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB for seeding...');

    // Clear existing organisations collection (optional)
    await Organisation.deleteMany({});
    console.log('Existing organisation data cleared.');

    // Reset ReturnOfEarnings collection so tests/seeding start clean
    try {
      await ReturnOfEarnings.deleteMany({});
      console.log('Existing ReturnOfEarnings data cleared.');
    } catch (e) {
      console.warn('Warning: could not clear ReturnOfEarnings collection (it may not exist yet).', e.message);
    }

    // Insert seed organisations
    await Organisation.insertMany(seedOrganisations);
    console.log('Dummy organisation data inserted successfully.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB, seeding completed.');

  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seedDB();
