// Esempio pratico di funzioni personalizzate per TsTemplater
import { TsTemplater } from './src/index';

// Inizializza TsTemplater
const templater = new TsTemplater('it');

// Definisce funzioni personalizzate per il business
const businessFunctions = {
    // Calcola lo sconto in base al tipo di cliente  
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

    // Formatta numeri di telefono in stile italiano
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

    // Saluto personalizzato in base all'ora
    'GreetingTime': (data, params) => {
        const hour = new Date().getHours();
        const name = data.firstName || 'Cliente';
        
        let greeting;
        if (hour < 12) greeting = 'Buongiorno';
        else if (hour < 18) greeting = 'Buon pomeriggio';
        else greeting = 'Buonasera';
        
        return `${greeting} ${name}`;
    },

    // Valutazione stellare da 1 a 5
    'StarRating': (params) => {
        const rating = Math.max(1, Math.min(5, Number(params[0]) || 1));
        const fullStars = '⭐'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.floor(rating));
        return fullStars + emptyStars;
    },

    // Stato ordine con emoji
    'OrderStatusEmoji': (data, params) => {
        const status = data.status;
        const statusMap = {
            'pending': '⏳ In Attesa',
            'processing': '🔄 In Elaborazione', 
            'shipped': '📦 Spedito',
            'delivered': '✅ Consegnato',
            'cancelled': '❌ Annullato'
        };
        return statusMap[status] || '❓ Sconosciuto';
    }
};

// Inietta le funzioni personalizzate
templater.setFunctions(businessFunctions);

// Esempio di utilizzo con template email
const customerData = {
    firstName: 'Marco',
    lastName: 'Rossi',
    customerType: 'premium',
    phone: '3331234567',
    order: {
        id: 'ORD-2024-001',
        total: 299.90,
        status: 'shipped',
        items: [
            { name: 'Smartphone', price: 199.90, qty: 1 },
            { name: 'Cover', price: 29.90, qty: 1 },
            { name: 'Pellicola', price: 9.90, qty: 1 }
        ]
    },
    review: { rating: 4.5 }
};

const emailTemplate = `
{!@GreetingTime} {lastName}! 👋

🎉 Il tuo ordine {order.id} è stato spedito!

📞 Per contatti: {!@PhoneIT|{phone}}

📦 Status: {!@OrderStatusEmoji}

🛍️ Articoli ordinati:
{#@ArrayConcat|order.items|• {name} x{qty} - €{price}
}

💰 Totale: €{order.total}
💸 Sconto Cliente {customerType}: -€{!@CustomerDiscount|{order.total}}

⭐ Valutazione ricevuta: {!@StarRating|{review.rating}}

Grazie per aver scelto il nostro servizio! 🙏
`;

console.log('=== EMAIL GENERATA ===');
console.log(templater.parse(emailTemplate, customerData));

// Esempio di template per dashboard amministrativa
const dashboardTemplate = `
📊 DASHBOARD CLIENTI

Cliente: {firstName} {lastName}
Tipo: {customerType}
Telefono: {!@PhoneIT|{phone}}

Ordine #{order.id}
Stato: {!@OrderStatusEmoji}
Totale: €{order.total}
Sconto Applicato: €{!@CustomerDiscount|{order.total}}

Valutazione: {!@StarRating|{review.rating}}
`;

console.log('\n=== DASHBOARD ADMIN ===');
console.log(templater.parse(dashboardTemplate, customerData));

// Esempio di utilizzo con evaluate() per calcoli
console.log('\n=== CALCOLI DINAMICI ===');
console.log('Sconto calcolato:', templater.evaluate('!@CustomerDiscount|{order.total}', customerData));
console.log('Rating stelle:', templater.evaluate('!@StarRating|{review.rating}', customerData));
