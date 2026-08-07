const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
const outputPath = 'public/NotifyMe_Manual.pdf';
doc.pipe(fs.createWriteStream(outputPath));

doc.fontSize(24).text('NotifyMe User Manual', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Welcome to NotifyMe! This guide will help you understand how to use your QR tags, manage subscriptions, and use the communication features securely.', { align: 'center' });
doc.moveDown(2);

doc.fontSize(18).text('1. Getting Started');
doc.fontSize(12).text('When you receive your NotifyMe QR tag, scan it to register it to your account. You can give it a specific name like "My Car" or "My Keys".');
doc.moveDown();

doc.fontSize(18).text('2. How Scanning Works');
doc.fontSize(12).text('When someone finds your item, they simply scan the QR code. They will be taken to a secure web portal where they can contact you anonymously. Your personal phone number and email are never revealed to the scanner.');
doc.moveDown();

doc.fontSize(18).text('3. Communication Features');
doc.fontSize(12).text('- Secure Messaging: Scanners can send you text messages instantly.\n- Image Sharing: Scanners can upload pictures of the item they found.\n- VoIP Calling (Premium): If you are a Premium member, scanners can place direct internet calls to your NotifyMe app, exactly like a WhatsApp call.');
doc.moveDown();

doc.fontSize(18).text('4. Subscriptions & Premium');
doc.fontSize(12).text('The Free tier allows up to 2 active QR tags with basic messaging. Upgrading to Premium (₹12/month) unlocks VoIP internet calling, advanced analytics, and priority support.');
doc.moveDown();

doc.fontSize(18).text('5. Support');
doc.fontSize(12).text('If you have any issues, use the "Contact Customer Care" button in the Support Center of your Owner Admin Portal.');
doc.moveDown();

doc.fontSize(10).fillColor('gray').text('© 2026 NotifyMe Inc. All rights reserved.', { align: 'center', bottom: 50 });

doc.end();
console.log('PDF generated at ' + outputPath);
