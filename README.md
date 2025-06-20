# K2B EXPRESS

A premium e-commerce platform for shipping and logistics products in Bangladesh. Built with Next.js 14, TypeScript, and MongoDB.

## 🚀 Features

### Core E-commerce Features

- **Product Management** - Complete product catalog with categories and subcategories
- **Shopping Cart** - Persistent cart with quantity management
- **User Authentication** - Secure login/signup with email verification
- **Order Management** - Complete order lifecycle from cart to delivery
- **Payment Integration** - bKash payment gateway integration
- **Wishlist** - Save favorite products for later

### Advanced Search & Discovery

- **Enterprise Search** - Multi-field fuzzy search with relevance scoring
- **Faceted Filtering** - Filter by category, price, and other attributes
- **Search Suggestions** - Autocomplete and trending searches
- **Related Products** - AI-powered product recommendations

### SEO & Performance

- **Enterprise SEO** - Comprehensive SEO optimization with structured data
- **Dynamic Sitemaps** - Auto-generated XML sitemaps
- **Breadcrumb Navigation** - SEO-friendly navigation structure
- **PWA Support** - Progressive Web App capabilities
- **Performance Optimized** - Fast loading with Core Web Vitals optimization

### Admin Panel

- **Product Management** - Add, edit, and manage products
- **Category Management** - Organize products with categories and subcategories
- **Order Management** - Process and track orders
- **Customer Management** - View and manage customer data
- **Analytics Dashboard** - Sales and performance insights

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **NextAuth.js** - Authentication solution
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### SEO & Performance

- **Structured Data** - JSON-LD markup for search engines
- **Dynamic Metadata** - SEO-optimized meta tags
- **Image Optimization** - Next.js Image component
- **Font Optimization** - Web font loading optimization
- **PWA Manifest** - Progressive Web App support

## 📁 Project Structure

```
k2bexpress/
├── app/                    # Next.js App Router
│   ├── (store)/           # Public store pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # Reusable components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── models/               # MongoDB schemas
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── ui/                   # UI components (shadcn/ui)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Email service (for verification emails)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/k2b-express.git
   cd k2b-express
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   EMAIL_SERVER_HOST=your_smtp_host
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your_email
   EMAIL_SERVER_PASSWORD=your_password
   EMAIL_FROM=noreply@k2bexpress.com
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### SEO Configuration

The SEO settings are centralized in `lib/seo.ts`. Update the `siteConfig` object to customize:

- Site name and description
- Social media handles
- Keywords and meta tags
- Structured data settings

### Database Configuration

MongoDB connection is configured in `lib/dbConnect.ts`. Ensure your MongoDB instance is running and accessible.

### Email Configuration

Email service is configured in `lib/email-service.ts`. Update SMTP settings for email verification and notifications.

## 📊 SEO Implementation

### Key SEO Features

- **Dynamic Metadata** - Each page has optimized title, description, and keywords
- **Structured Data** - JSON-LD markup for products, categories, and breadcrumbs
- **XML Sitemap** - Auto-generated sitemap at `/sitemap.xml`
- **Robots.txt** - Search engine crawling directives
- **Breadcrumb Navigation** - SEO-friendly navigation structure
- **PWA Support** - Progressive Web App manifest

### SEO Components

- `lib/seo.ts` - SEO utility functions
- `ui/custom/Breadcrumb.tsx` - Breadcrumb navigation component
- `ui/custom/StructuredData.tsx` - JSON-LD structured data injection
- `app/sitemap.ts` - Dynamic sitemap generation
- `app/robots.ts` - Robots.txt configuration

For detailed SEO documentation, see [SEO_OPTIMIZATION.md](./SEO_OPTIMIZATION.md)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📈 Performance

### Core Web Vitals

- **LCP (Largest Contentful Paint)** - Optimized with image loading
- **FID (First Input Delay)** - Minimal JavaScript blocking
- **CLS (Cumulative Layout Shift)** - Stable layouts with proper sizing

### Optimization Features

- **Image Optimization** - Automatic WebP conversion and responsive images
- **Font Optimization** - Display swap for better loading
- **Code Splitting** - Automatic route-based code splitting
- **Caching** - Static generation and ISR for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@k2bexpress.com or create an issue in the GitHub repository.

## 🔗 Links

- [Live Demo](https://k2bexpress.com)
- [Documentation](./SEO_OPTIMIZATION.md)
- [Issues](https://github.com/your-username/k2b-express/issues)

---

Built with ❤️ for the Bangladesh shipping industry
