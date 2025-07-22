// Practical example of custom functions for TsTemplater
import { TsTemplater } from './src/index';

// Initialize TsTemplater
const templater = new TsTemplater('en');

// Define custom business functions
const businessFunctions = {
    // Calculate discount based on customer type
    'CustomerDiscount': (data, params) => {
        const amount = Number(params[0]) || 0;
        const customerType = data.customerType;
        
        let discountRate = 0;
        switch (customerType) {
            case 'vip': discountRate = 0.20; break;
            case 'premium': discountRate = 0.15; break;
            case 'gold': discountRate = 0.10; break;
            case 'silver': discountRate = 0.05; break;
            default: discountRate = 0;
        }
        
        return (amount * discountRate).toFixed(2);
    },

    // Format phone numbers in Italian style
    'PhoneIT': (params) => {
        if (!params || params.length !== 1) return '';
        const phone = params[0].toString().replace(/\D/g, '');
        
        if (phone.length === 10) {
            return `${phone.slice(0,3)} ${phone.slice(3,6)} ${phone.slice(6)}`;
        } else if (phone.length === 11 && phone.startsWith('3')) {
            return `+39 ${phone.slice(0,3)} ${phone.slice(3,6)} ${phone.slice(6)}`;
        }
        return phone;
    },

    // Personalized greeting based on time of day
    'GreetingTime': (data, params) => {
        const hour = new Date().getHours();
        const name = data.firstName || 'Customer';
        
        let greeting;
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        
        return `${greeting} ${name}`;
    },

    // Star rating from 1 to 5
    'StarRating': (params) => {
        const rating = Math.max(1, Math.min(5, Number(params[0]) || 1));
        const fullStars = '⭐'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.floor(rating));
        return fullStars + emptyStars;
    },

    // Order status with emoji
    'OrderStatusEmoji': (data, params) => {
        const status = data.status;
        const statusMap = {
            'pending': '⏳ Pending',
            'processing': '🔄 Processing', 
            'shipped': '📦 Shipped',
            'delivered': '✅ Delivered',
            'cancelled': '❌ Cancelled'
        };
        return statusMap[status] || '❓ Unknown';
    }
};

// Inject custom functions
templater.setFunctions(businessFunctions);

// Example usage with email template
const customerData = {
    firstName: 'John',
    lastName: 'Smith',
    customerType: 'premium',
    phone: '3331234567',
    order: {
        id: 'ORD-2024-001',
        total: 299.90,
        status: 'shipped',
        items: [
            { name: 'Smartphone', price: 199.90, qty: 1 },
            { name: 'Case', price: 29.90, qty: 1 },
            { name: 'Screen Protector', price: 9.90, qty: 1 }
        ]
    },
    review: { rating: 4.5 }
};

const emailTemplate = `
{!@GreetingTime} {lastName}! 👋

🎉 Your order {order.id} has been shipped!

📞 Contact us: {!@PhoneIT|{phone}}

📦 Status: {!@OrderStatusEmoji}

🛍️ Ordered items:
{#@ArrayConcat|order.items|• {name} x{qty} - €{price}
}

💰 Total: €{order.total}
💸 Customer {customerType} discount: -€{!@CustomerDiscount|{order.total}}

⭐ Review received: {!@StarRating|{review.rating}}

Thank you for choosing our service! 🙏
`;

console.log('=== GENERATED EMAIL ===');
console.log(templater.parse(emailTemplate, customerData));

// Example of admin dashboard template
const dashboardTemplate = `
📊 CUSTOMER DASHBOARD

Customer: {firstName} {lastName}
Type: {customerType}
Phone: {!@PhoneIT|{phone}}

Order #{order.id}
Status: {!@OrderStatusEmoji}
Total: €{order.total}
Applied Discount: €{!@CustomerDiscount|{order.total}}

Rating: {!@StarRating|{review.rating}}
`;

console.log('\n=== ADMIN DASHBOARD ===');
console.log(templater.parse(dashboardTemplate, customerData));

// Example of using evaluate() for calculations
console.log('\n=== DYNAMIC CALCULATIONS ===');
console.log('Calculated discount:', templater.evaluate('!@CustomerDiscount|{order.total}', customerData));
console.log('Star rating:', templater.evaluate('!@StarRating|{review.rating}', customerData));
