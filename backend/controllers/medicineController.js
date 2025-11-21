const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all medicines (admin or superadmin only)
const getAllMedicines = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'doctor' && req.user.role !== 'nurse') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const medicines = await Medicine.find().sort({ name: 1, expiryDate: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new medicine
const createMedicine = async (req, res) => {
  try {
    const { name, quantityInStock, unit, expiryDate } = req.body;

    if (!name || !quantityInStock || !unit || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expiry = new Date(expiryDate);
    const startOfDay = new Date(expiry);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(expiry);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await Medicine.findOne({
      name,
      expiryDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      existing.quantityInStock += parseInt(quantityInStock);
      existing.available = existing.quantityInStock > 0;
      await existing.save();
      return res.status(200).json(existing);
    }

    const newMedicine = new Medicine({
      name,
      quantityInStock: parseInt(quantityInStock),
      unit,
      expiryDate: expiry,
      available: parseInt(quantityInStock) > 0
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    console.error('Create medicine error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Dispense capsules using :id
const dispenseCapsules = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, appointmentId } = req.body;

    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    if (med.quantityInStock < quantity) {
      return res.status(400).json({ error: 'Not enough stock to dispense' });
    }

    med.quantityInStock -= quantity;
    med.available = med.quantityInStock > 0;

    // Extract user ID from token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Token decode failed:', err.message);
      }
    }

    // Log dispense history
    med.dispenseHistory = med.dispenseHistory || [];
    med.dispenseHistory.push({
      appointmentId: appointmentId ? new mongoose.Types.ObjectId(appointmentId) : null,
      quantity,
      dispensedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
      dispensedAt: new Date(),
      source: appointmentId ? 'consultation' : 'manual'
    });

    await med.save();

    res.json({ message: 'Medicine dispensed', medicine: med });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deduct multiple medicines (used in consultation)
const deductMedicines = async (req, res) => {
  try {
    const { prescribed } = req.body;

    if (!Array.isArray(prescribed)) {
      return res.status(400).json({ error: 'Invalid prescribed list' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Token decode failed:', err.message);
      }
    }

    for (const item of prescribed) {
      const med = await Medicine.findById(item.medicineId);
      if (!med) continue;

      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        console.warn(`Invalid quantity for ${med.name}:`, item.quantity);
        continue;
      }

      if (med.quantityInStock < qty) {
        return res.status(400).json({ error: `Not enough stock for ${med.name}` });
      }

      med.quantityInStock -= qty;
      med.available = med.quantityInStock > 0;

      med.dispenseHistory = med.dispenseHistory || [];
      med.dispenseHistory.push({
        appointmentId: item.appointmentId ? new mongoose.Types.ObjectId(item.appointmentId) : null,
        quantity: qty,
        dispensedBy: userId ? new mongoose.Types.ObjectId(userId) : null,
        dispensedAt: new Date(),
        source: 'consultation'
      });

      await med.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Deduction error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const deleted = await Medicine.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Medicine not found' });

    return res.json({ message: 'Medicine deleted', id });
  } catch (err) {
    console.error('Delete medicine error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get dispense history for a specific medicine
const getDispenseHistory = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id)
      .populate('dispenseHistory.appointmentId', 'firstName lastName appointmentDate')
      .populate('dispenseHistory.dispensedBy', 'name');

    if (!med) return res.status(404).json({ error: 'Medicine not found' });

    res.json(med.dispenseHistory);
  } catch (err) {
    console.error('Dispense history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Get all dispense history across medicines
const getAllDispenseHistory = async (req, res) => {
  try {
    const medicines = await Medicine.find({}, 'name dispenseHistory')
      .populate('dispenseHistory.appointmentId', 'firstName lastName appointmentDate')
      .populate('dispenseHistory.dispensedBy', 'name');

    const allHistory = [];

    medicines.forEach(med => {
      med.dispenseHistory.forEach(record => {
        const sourceLabel =
          record.source === 'consultation'
            ? 'consultation dispence'
            : record.source === 'manual'
            ? 'manual dispence'
            : 'Unknown';

        allHistory.push({
          medicineName: med.name,
          quantity: record.quantity,
          dispensedAt: record.dispensedAt,
          dispensedBy: record.dispensedBy,
          appointmentId: record.appointmentId,
          source: sourceLabel
        });
      });
    });

    res.json(allHistory);
  } catch (err) {
    console.error('Global dispense history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch global history' });
  }
};

// Generate PDF report for dispense history
const generateDispenseHistoryPDF = async (req, res) => {
  try {
    const { startDate, endDate, medicineName } = req.query;

    // Check if any filters are applied
    if (!startDate && !endDate && !medicineName) {
      return res.status(400).json({ error: 'Please apply at least one filter (start date, end date, or medicine name) to generate the dispense history report.' });
    }

    const medicines = await Medicine.find({}, 'name dispenseHistory')
      .populate('dispenseHistory.appointmentId', 'firstName lastName appointmentDate')
      .populate('dispenseHistory.dispensedBy', 'name');

    const allHistory = [];
    medicines.forEach(med => {
      med.dispenseHistory.forEach(record => {
        if (medicineName && !med.name.toLowerCase().includes(medicineName.toLowerCase())) return;
        if (startDate) {
          const start = new Date(startDate);
          start.setUTCHours(0, 0, 0, 0);
          if (new Date(record.dispensedAt) < start) return;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setUTCHours(23, 59, 59, 999);
          if (new Date(record.dispensedAt) > end) return;
        }

        const sourceLabel =
          record.source === 'consultation'
            ? 'consultation dispence'
            : record.source === 'manual'
            ? 'manual dispence'
            : 'Unknown';

        allHistory.push({
          medicineName: med.name,
          quantity: record.quantity,
          dispensedAt: record.dispensedAt,
          dispensedBy: record.dispensedBy ? record.dispensedBy.name : 'Unknown',
          appointmentId: record.appointmentId,
          source: sourceLabel
        });
      });
    });

    // Sort by dispensedAt descending
    allHistory.sort((a, b) => new Date(b.dispensedAt) - new Date(a.dispensedAt));

    // Create PDF
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=dispense-history-report.pdf');
      res.send(pdfBuffer);
    });

    // Add header for first page
    doc.fontSize(20).text('Medical System - Dispense History Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Filters (only on first page)
    if (startDate || endDate || medicineName) {
      doc.fontSize(10).text('Filters Applied:', { underline: true });
      if (startDate) doc.text(`From: ${new Date(startDate).toLocaleDateString()}`);
      if (endDate) doc.text(`To: ${new Date(endDate).toLocaleDateString()}`);
      if (medicineName) doc.text(`Medicine: ${medicineName}`);
      doc.moveDown();
    }

    if (allHistory.length === 0) {
      doc.fontSize(14).text('No dispense history records found for the applied filters.', { align: 'center' });
    } else {
      // Table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Medicine', 50, tableTop);
      doc.text('Quantity', 150, tableTop);
      doc.text('Dispensed', 220, tableTop);
      doc.text('Source', 350, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 25;
      allHistory.forEach(record => {
        if (y > 600) { // New page if needed, leaving more space for footer
          doc.addPage();
          // Add header for new page (smaller font to fit)
          doc.fontSize(16).text('Medical System - Dispense History Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
          doc.moveDown();
          // Add table header on new page
          doc.fontSize(10);
          doc.text('Medicine', 50, doc.y);
          doc.text('Quantity', 150, doc.y);
          doc.text('Dispensed', 220, doc.y);
          doc.text('Source', 350, doc.y);
          doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();
          y = doc.y + 25; // Start table after header
        }

        doc.text(record.medicineName, 50, y);
        doc.text(record.quantity.toString(), 150, y);
        doc.text(new Date(record.dispensedAt).toLocaleString(), 220, y);
        doc.text(record.source, 350, y);
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        y += 20;
      });

    }

    doc.end();

    // Add footer and digital signature to all pages
    const totalPages = doc.pageNumber;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      // Add footer at the bottom
      doc.fontSize(10);
      doc.text('Medical System - Dispense History Report', 50, doc.page.height - 100, { align: 'left' });
      doc.text('This report is generated electronically.', doc.page.width - 50, doc.page.height - 90, { align: 'right' });
      doc.text(`Page ${i + 1} of ${totalPages}`, doc.page.width / 2, doc.page.height - 80, { align: 'center' });
      // Add digital signature to all pages
      doc.text('Digital Signature:', doc.page.width - 50, doc.page.height - 65, { align: 'right' });
      doc.lineWidth(3).moveTo(doc.page.width - 200, doc.page.height - 60).lineTo(doc.page.width - 50, doc.page.height - 60).stroke();
      doc.text('Validated by Medical System on ' + new Date().toLocaleDateString(), doc.page.width - 50, doc.page.height - 55, { align: 'right' });
    }

  } catch (err) {
    console.error('PDF generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }






  // Add footer and digital signature to all pages BEFORE ending the document
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  doc.fontSize(10);
  doc.text('Medical System - Dispense History Report', 50, pageHeight - 100, { align: 'left' });
  doc.text('This report is generated electronically.', pageWidth - 50, pageHeight - 90, { align: 'right' });
  doc.text(`Page ${i + 1} of ${totalPages}`, pageWidth / 2, pageHeight - 80, { align: 'center' });

  doc.text('Digital Signature:', pageWidth - 50, pageHeight - 65, { align: 'right' });
  doc.lineWidth(3).moveTo(pageWidth - 200, pageHeight - 60).lineTo(pageWidth - 50, pageHeight - 60).stroke();
  doc.text('Validated by Medical System on ' + new Date().toLocaleDateString(), pageWidth - 50, pageHeight - 55, { align: 'right' });
}

doc.end(); // Finalize after all pages are updated
};

module.exports = {
  getAllMedicines,
  createMedicine,
  dispenseCapsules,
  deductMedicines,
  deleteMedicine,
  getDispenseHistory,
  getAllDispenseHistory,
  generateDispenseHistoryPDF
};
