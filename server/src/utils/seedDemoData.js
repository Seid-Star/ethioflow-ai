import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import InventoryMovement from "../models/InventoryMovement.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";
import Expense from "../models/Expense.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Refund from "../models/Refund.js";
import Notification from "../models/Notification.js";
import AIMessage from "../models/AIMessage.js";
import AuditLog from "../models/AuditLog.js";
import SubscriptionInvoice from "../models/SubscriptionInvoice.js";

const DEMO_EMAIL = "abebe@demo.ethioflow.ai";
const HISTORY_DAYS = 45; // deliberately > 30, so data reliably spans two calendar months

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearPreviousDemoData() {
  console.log("🧹 Clearing previous demo data...");
  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (!existingUser) return;

  const businessId = existingUser.business;
  await Promise.all([
    Sale.deleteMany({ business: businessId }),
    Refund.deleteMany({ business: businessId }),
    InventoryMovement.deleteMany({ business: businessId }),
    Customer.deleteMany({ business: businessId }),
    Supplier.deleteMany({ business: businessId }),
    Purchase.deleteMany({ business: businessId }),
    Expense.deleteMany({ business: businessId }),
    Product.deleteMany({ business: businessId }),
    Employee.deleteMany({ business: businessId }),
    Attendance.deleteMany({ business: businessId }),
    LeaveRequest.deleteMany({ business: businessId }),
    Notification.deleteMany({ business: businessId }),
    AIMessage.deleteMany({ business: businessId }),
    AuditLog.deleteMany({ business: businessId }),
    SubscriptionInvoice.deleteMany({ business: businessId }),
  ]);
  await User.deleteMany({ business: businessId });
  await Business.deleteOne({ _id: businessId });
}

async function createBusinessAndOwner() {
  console.log("🏪 Creating Abebe General Store...");
  const DAY = 24 * 60 * 60 * 1000;
  const periodStart = new Date(Date.now() - 30 * DAY);
  const periodEnd = new Date(Date.now() + 335 * DAY);

  const business = await Business.create({
    name: "Abebe General Store",
    type: "General Merchant",
    currency: "ETB",
    branches: [{ name: "Main Branch", isMain: true }],
    subscriptionPlan: "professional",
    subscriptionStatus: "active",
    billingCycle: "yearly",
    currentPeriodEnd: periodEnd,
  });

  const owner = await User.create({
    business: business._id,
    name: "Abebe Kebede",
    email: DEMO_EMAIL,
    phone: "0911200099",
    password: "Demo1234",
    role: "owner",
    emailVerified: true,
  });

  // A paid yearly invoice, so the billing history isn't empty
  const invoice = await SubscriptionInvoice.create({
    business: business._id,
    plan: "professional",
    billingCycle: "yearly",
    amount: 7990,
    paymentMethod: "mobile_money",
    reference: "EF-DEMO-0001",
    periodStart,
    periodEnd,
    createdBy: owner._id,
  });
  await SubscriptionInvoice.updateOne(
    { _id: invoice._id },
    { createdAt: periodStart },
  );

  return { business, owner };
}

async function createProducts(business) {
  console.log("📦 Creating products...");
  const productDefs = [
    {
      name: "Cooking Oil",
      barcode: "6210000000001",
      costPrice: 180,
      sellingPrice: 220,
      currentStock: 45,
      minStock: 15,
      unit: "liter",
    },
    {
      name: "Sugar",
      barcode: "6210000000002",
      costPrice: 60,
      sellingPrice: 75,
      currentStock: 90,
      minStock: 20,
      unit: "kg",
    },
    {
      name: "Flour",
      barcode: "6210000000003",
      costPrice: 50,
      sellingPrice: 65,
      currentStock: 70,
      minStock: 20,
      unit: "kg",
    },
    {
      name: "Soap",
      barcode: "6210000000004",
      costPrice: 25,
      sellingPrice: 35,
      currentStock: 120,
      minStock: 30,
      unit: "pcs",
    },
    {
      name: "Milk",
      barcode: "6210000000005",
      costPrice: 40,
      sellingPrice: 50,
      currentStock: 8,
      minStock: 15,
      unit: "liter",
    },
    {
      name: "Coffee",
      barcode: "6210000000006",
      costPrice: 200,
      sellingPrice: 260,
      currentStock: 35,
      minStock: 10,
      unit: "kg",
    },
    {
      name: "Biscuits",
      barcode: "6210000000007",
      costPrice: 15,
      sellingPrice: 22,
      currentStock: 150,
      minStock: 40,
      unit: "pcs",
    },
  ];

  const products = await Product.insertMany(
    productDefs.map((p) => ({ ...p, business: business._id })),
  );
  return products;
}

async function createCustomers(business) {
  console.log("👥 Creating customers...");
  const defs = [
    {
      name: "Hana Tesfaye",
      phone: "0922111111",
      loyaltyPoints: 180,
      notes: [
        {
          text: "Prefers mobile money. Usually settles her balance at the start of the month.",
        },
      ],
    },
    {
      name: "Dawit Alemu",
      phone: "0933222222",
      loyaltyPoints: 75,
      notes: [{ text: "Buys in bulk before holidays." }],
    },
    {
      name: "Meron Girma",
      phone: "0944333333",
      loyaltyPoints: 320,
      notes: [{ text: "Regular customer. Always asks for coffee first." }],
    },
  ];
  return Customer.insertMany(
    defs.map((c) => ({ ...c, business: business._id })),
  );
}

async function createSuppliers(business) {
  console.log("🚚 Creating suppliers...");
  const defs = [
    { name: "Merkato Wholesale", phone: "0911555555" },
    { name: "Addis Distributors", phone: "0911666666" },
  ];
  return Supplier.insertMany(
    defs.map((s) => ({ ...s, business: business._id })),
  );
}

async function generateSalesHistory(business, owner, products, customers) {
  console.log(
    `💰 Generating ${HISTORY_DAYS} days of sales history (this may take a minute)...`,
  );

  const productMap = {};
  for (const p of products) productMap[p.name] = p;
  // Milk is deliberately excluded from ever being sold — stays low-stock with
  // zero velocity, so the "not enough history" forecast fallback is demonstrable.
  const sellableProducts = products.filter((p) => p.name !== "Milk");

  const today = new Date();

  for (let daysBack = HISTORY_DAYS - 1; daysBack >= 0; daysBack--) {
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysBack);

    const salesToday = Math.random() > 0.1 ? randomInt(2, 5) : 0;

    for (let s = 0; s < salesToday; s++) {
      const itemCount = randomInt(1, 3);
      const chosenProducts = [...sellableProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, itemCount);

      const saleItems = [];
      let subtotal = 0;

      for (const product of chosenProducts) {
        const freshProduct = await Product.findById(product._id);
        const quantity = randomInt(1, 4);
        if (freshProduct.currentStock < quantity) continue;

        const previousStock = freshProduct.currentStock;
        freshProduct.currentStock -= quantity;
        await freshProduct.save();

        await InventoryMovement.create({
          business: business._id,
          product: freshProduct._id,
          type: "sale",
          previousStock,
          change: -quantity,
          newStock: freshProduct.currentStock,
          reason: "POS sale",
          performedBy: owner._id,
          createdAt: saleDate,
        });

        const lineTotal = freshProduct.sellingPrice * quantity;
        subtotal += lineTotal;
        saleItems.push({
          product: freshProduct._id,
          name: freshProduct.name,
          quantity,
          unitPrice: freshProduct.sellingPrice,
          costPriceAtSale: freshProduct.costPrice,
          lineTotal,
        });
      }

      if (saleItems.length === 0) continue;

      const useCreditSale = Math.random() > 0.75;
      const customer = useCreditSale
        ? customers[randomInt(0, customers.length - 1)]
        : null;
      const total = subtotal;

      const sale = await Sale.create({
        business: business._id,
        cashier: owner._id,
        customer: customer?._id,
        items: saleItems,
        subtotal,
        discount: 0,
        tax: 0,
        total,
        payments: [
          { method: customer ? "customer_credit" : "cash", amount: total },
        ],
        paymentMethod: customer ? "customer_credit" : "cash",
        amountPaid: total,
      });
      await Sale.updateOne({ _id: sale._id }, { createdAt: saleDate });

      if (customer) {
        const freshCustomer = await Customer.findById(customer._id);
        freshCustomer.recordEntry({
          type: "purchase",
          amount: total,
          note: "POS sale",
          relatedSale: sale._id,
        });
        await freshCustomer.save();
      }
    }
  }

  console.log("✅ Sales history generated");
}

async function generatePartialPayments(customers) {
  console.log(
    "💳 Generating some customer payments (so balances look realistic, not all-or-nothing)...",
  );
  for (const customer of customers) {
    const fresh = await Customer.findById(customer._id);
    if (fresh.outstandingBalance > 0 && Math.random() > 0.4) {
      const paymentAmount = Math.round(
        fresh.outstandingBalance * (0.3 + Math.random() * 0.4),
      ); // pay 30-70% of what they owe
      fresh.recordEntry({
        type: "payment",
        amount: paymentAmount,
        note: "Partial payment",
      });
      await fresh.save();
    }
  }
}

async function generatePurchaseHistory(business, owner, suppliers, products) {
  console.log("📥 Generating supplier purchase history...");

  const today = new Date();

  for (let i = 0; i < 4; i++) {
    const supplier = suppliers[i % suppliers.length];
    const daysBack = randomInt(5, HISTORY_DAYS - 5);
    const purchaseDate = new Date(today);
    purchaseDate.setDate(purchaseDate.getDate() - daysBack);

    const itemCount = randomInt(1, 2);
    const chosenProducts = [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, itemCount);

    const purchaseItems = [];
    let totalAmount = 0;

    for (const product of chosenProducts) {
      const freshProduct = await Product.findById(product._id);
      const quantity = randomInt(20, 60);
      const costPrice = freshProduct.costPrice;

      const previousStock = freshProduct.currentStock;
      freshProduct.currentStock += quantity;
      await freshProduct.save();

      await InventoryMovement.create({
        business: business._id,
        product: freshProduct._id,
        type: "stock_in",
        previousStock,
        change: quantity,
        newStock: freshProduct.currentStock,
        reason: `Purchase from ${supplier.name}`,
        performedBy: owner._id,
        createdAt: purchaseDate,
      });

      const lineTotal = costPrice * quantity;
      totalAmount += lineTotal;
      purchaseItems.push({
        product: freshProduct._id,
        name: freshProduct.name,
        quantity,
        costPrice,
        lineTotal,
      });
    }

    const amountPaid =
      Math.random() > 0.5 ? totalAmount : Math.round(totalAmount * 0.6);

    const purchase = await Purchase.create({
      business: business._id,
      supplier: supplier._id,
      items: purchaseItems,
      totalAmount,
      amountPaid,
      recordedBy: owner._id,
      notes: "Stock delivery",
    });
    await Purchase.updateOne(
      { _id: purchase._id },
      { createdAt: purchaseDate },
    );

    const freshSupplier = await Supplier.findById(supplier._id);
    freshSupplier.recordEntry({
      type: "purchase",
      amount: totalAmount,
      note: "Stock delivery",
      relatedPurchase: purchase._id,
    });
    if (amountPaid > 0) {
      freshSupplier.recordEntry({
        type: "payment",
        amount: amountPaid,
        note: "Paid at delivery",
        relatedPurchase: purchase._id,
      });
    }
    await freshSupplier.save();
  }

  console.log("✅ Purchase history generated");
}

async function generateExpenses(business, owner) {
  console.log("🧾 Generating expense history...");

  const today = new Date();
  const monthsSpanned = Math.ceil(HISTORY_DAYS / 30) + 1;

  // Rent and Salary: once per calendar month, realistic fixed costs
  for (let m = 0; m < monthsSpanned; m++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - m);
    date.setDate(3);

    await Expense.create({
      business: business._id,
      category: "Rent",
      amount: 8000,
      date,
      recordedBy: owner._id,
      note: "Monthly rent",
    });
    await Expense.create({
      business: business._id,
      category: "Salary",
      amount: 6000,
      date,
      recordedBy: owner._id,
      note: "Staff salary",
    });
  }

  // Electricity, Transport, Internet, Maintenance: scattered irregularly through the period
  const variableCategories = [
    "Electricity",
    "Transport",
    "Internet",
    "Maintenance",
  ];
  for (
    let daysBack = HISTORY_DAYS - 1;
    daysBack >= 0;
    daysBack -= randomInt(4, 9)
  ) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysBack);
    const category =
      variableCategories[randomInt(0, variableCategories.length - 1)];
    const amount =
      category === "Electricity" ? randomInt(2500, 4000) : randomInt(200, 1200);

    await Expense.create({
      business: business._id,
      category,
      amount,
      date,
      recordedBy: owner._id,
    });
  }

  console.log("✅ Expenses generated");
}
async function createEmployees(business, owner) {
  console.log("🧑‍💼 Creating employees...");
  const defs = [
    {
      name: "Hana Girma",
      department: "Sales",
      position: "Cashier",
      phone: "0911200001",
      monthlySalary: 3500,
    },
    {
      name: "Dawit Bekele",
      department: "Inventory",
      position: "Stock Keeper",
      phone: "0911200002",
      monthlySalary: 4200,
    },
    {
      name: "Selam Tadesse",
      department: "Finance",
      position: "Accountant",
      phone: "0911200003",
      monthlySalary: 5500,
    },
    {
      name: "Yonas Haile",
      department: "Sales",
      position: "Cashier",
      phone: "0911200004",
      monthlySalary: 3500,
    },
  ];
  const employees = await Employee.insertMany(
    defs.map((e) => ({ ...e, business: business._id, branch: "Main Branch" })),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const statuses = ["present", "present", "late", "present"];
  await Attendance.insertMany(
    employees.map((e, i) => ({
      business: business._id,
      employee: e._id,
      date: today,
      status: statuses[i],
      recordedBy: owner._id,
    })),
  );

  // One pending leave request, so Approve/Reject has something to show
  const start = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const end = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  await LeaveRequest.create({
    business: business._id,
    employee: employees[3]._id,
    startDate: start,
    endDate: end,
    reason: "Family event",
  });
}
async function seed() {
  await connectDB();

  await clearPreviousDemoData();
  const { business, owner } = await createBusinessAndOwner();
  const products = await createProducts(business);
  const customers = await createCustomers(business);
  const suppliers = await createSuppliers(business);

  await generateSalesHistory(business, owner, products, customers);
  await generatePartialPayments(customers);
  await generatePurchaseHistory(business, owner, suppliers, products);
  await generateExpenses(business, owner);

  console.log("\n✅ Demo data ready!");
  console.log(`   Business:  ${business.name}`);
  console.log(`   Login:     ${DEMO_EMAIL} / Demo1234`);
  console.log(
    `   Products:  ${products.length} (Milk is low-stock with zero sales history — tests the honest forecast fallback)`,
  );
  console.log(
    `   Customers: ${customers.length} (some with outstanding balances, some partially paid)`,
  );
  console.log(`   Suppliers: ${suppliers.length} (with purchase history)`);
  console.log(
    `   History:   ${HISTORY_DAYS} days — spans two calendar months, so AI profit comparison has real data\n`,
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
