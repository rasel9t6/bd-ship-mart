import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import './Category';
const Category = mongoose.models.Category || mongoose.model('Category');

type CurrencyRates = {
  toBDT: number;
  toCNY?: number;
  toUSD?: number;
};

type ConversionRates = {
  [key: string]: CurrencyRates;
};

// Define media type interface
interface IMediaItem {
  url: string;
  type: 'image' | 'video';
}

// Create custom type for price and expense
interface ICurrency {
  cny: number;
  usd: number;
  bdt: number;
}

interface IRange {
  minQuantity: number;
  maxQuantity?: number;
  price: ICurrency;
}

// Define the Product interface - UPDATED with featured fields
interface IProduct extends Document {
  sku: string;
  title: string;
  slug: string;
  description?: string;
  media: IMediaItem[];
  colors: IMediaItem[];
  categories: mongoose.Types.ObjectId[];
  subcategories: mongoose.Types.ObjectId[];
  tags: string[];
  sizes: string[];
  minimumOrderQuantity: number;
  inputCurrency: 'CNY' | 'USD';
  quantityPricing: { ranges: IRange[] };
  price: ICurrency;
  expense: ICurrency;
  currencyRates: {
    usdToBdt: number;
    cnyToBdt: number;
  };
  // NEW: Featured fields
  featured: boolean;
  featuredPriority: number;
  viewCount: number;
  // Methods
  hasOverlappingRanges(ranges: IRange[]): boolean;
  performCurrencyConversions(): void;
  setFeatured(priority?: number): Promise<IProduct>;
  unsetFeatured(): Promise<IProduct>;
}

// Create Currency schema
const CurrencySchema = new Schema<ICurrency>(
  {
    cny: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    usd: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
    bdt: {
      type: Number,
      min: [0, 'Value cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

// Create Media Item schema
const MediaItemSchema = new Schema<IMediaItem>(
  {
    url: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: 'Invalid media URL format',
      },
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
  },
  { _id: false }
);

// Create Range schema
const RangeSchema = new Schema<IRange>(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: {
      type: Number,
      min: [1, 'Max quantity must be at least 1'],
      validate: {
        validator: function (this: IRange & Document, v: number) {
          return !v || v >= this.minQuantity;
        },
        message:
          'Max quantity must be greater than or equal to minimum quantity',
      },
      required: false, // Make maxQuantity explicitly optional
    },
    price: CurrencySchema,
  },
  { _id: false }
);

// Main Product Schema - UPDATED with featured fields
const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [2000, 'Description cannot exceed 2000 characters'],
    },
    media: [MediaItemSchema],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'At least one category is required'],
      },
    ],
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
      },
    ],
    tags: [String],
    sizes: [String],
    colors: [MediaItemSchema],
    minimumOrderQuantity: {
      type: Number,
      required: true,
      min: [1, 'Minimum order quantity must be at least 1'],
      default: 1,
    },
    inputCurrency: {
      type: String,
      enum: ['CNY', 'USD'],
      required: [true, 'Input currency is required'],
      default: 'CNY',
    },
    quantityPricing: {
      ranges: {
        type: [RangeSchema],
        validate: {
          validator: function (this: IProduct, ranges: IRange[]) {
            // Fixed the validation logic - return false if ranges overlap
            return (
              !ranges ||
              ranges.length <= 1 ||
              !this.hasOverlappingRanges(ranges)
            );
          },
          message: 'Quantity ranges cannot overlap',
        },
      },
    },
    price: CurrencySchema,
    expense: CurrencySchema,
    currencyRates: {
      usdToBdt: { type: Number, required: true, default: 121.5 },
      cnyToBdt: { type: Number, required: true, default: 17.5 },
    },
    // NEW: Featured fields
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredPriority: {
      type: Number,
      default: 0,
      index: true,
      min: [0, 'Featured priority cannot be negative'],
      max: [100, 'Featured priority cannot exceed 100'],
    },
    viewCount: {
      type: Number,
      default: 0,
      index: true,
      min: [0, 'View count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Instance method to check for overlapping ranges
ProductSchema.methods.hasOverlappingRanges = function (
  ranges: IRange[]
): boolean {
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const range1 = ranges[i];
      const range2 = ranges[j];

      // Handle cases where maxQuantity might be undefined
      const range1Max =
        range1.maxQuantity === undefined ? Infinity : range1.maxQuantity;
      const range2Max =
        range2.maxQuantity === undefined ? Infinity : range2.maxQuantity;

      // Check for overlap
      const overlap =
        range1.minQuantity <= range2Max && range1Max >= range2.minQuantity;

      if (overlap) return true;
    }
  }
  return false;
};

// NEW: Featured product methods
ProductSchema.methods.setFeatured = function (priority = 0) {
  this.featured = true;
  this.featuredPriority = Math.max(0, Math.min(100, priority)); // Ensure 0-100 range
  return this.save();
};

ProductSchema.methods.unsetFeatured = function () {
  this.featured = false;
  this.featuredPriority = 0;
  return this.save();
};

// Populate category details automatically
ProductSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'categories',
  foreignField: '_id',
  justOne: false,
});

// Update parent Category on product save
ProductSchema.post('save', async function (doc: IProduct) {
  try {
    if (doc.categories.length > 0) {
      await Category.findByIdAndUpdate(doc.categories[0], {
        $addToSet: { products: doc._id },
      });
    }
  } catch (error) {
    console.error('❌ Error updating Category:', error);
  }
});

// Generate slug before saving
ProductSchema.pre<IProduct>('save', function (next) {
  try {
    if (!this.slug || this.isModified('title')) {
      this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Currency conversion logic
ProductSchema.methods.performCurrencyConversions = function () {
  const convertCurrency = (inputValue: number, rate: number) =>
    inputValue && rate ? Number((inputValue * rate).toFixed(2)) : 0;

  const performConversion = (
    inputCurrency: 'CNY' | 'USD',
    currencyObj: ICurrency
  ) => {
    if (!currencyObj || !this.currencyRates) return currencyObj;

    const rates: ConversionRates = {
      USD: { toBDT: this.currencyRates.usdToBdt, toCNY: 7 },
      CNY: { toBDT: this.currencyRates.cnyToBdt, toUSD: 1 / 7 },
    };

    const currentRates = rates[inputCurrency];

    if (inputCurrency === 'USD' && currencyObj.usd) {
      currencyObj.bdt = convertCurrency(currencyObj.usd, currentRates.toBDT);
      if (!currencyObj.cny) {
        currencyObj.cny = convertCurrency(currencyObj.usd, currentRates.toCNY!);
      }
    } else if (inputCurrency === 'CNY' && currencyObj.cny) {
      currencyObj.bdt = convertCurrency(currencyObj.cny, currentRates.toBDT);
      if (!currencyObj.usd) {
        currencyObj.usd = convertCurrency(currencyObj.cny, currentRates.toUSD!);
      }
    }

    return currencyObj;
  };

  if (this.price)
    this.price = performConversion(this.inputCurrency, this.price);
  if (this.expense)
    this.expense = performConversion(this.inputCurrency, this.expense);

  // Quantity pricing conversion
  if (this.quantityPricing?.ranges) {
    this.quantityPricing.ranges.forEach((range: IRange) => {
      if (range.price) {
        range.price = performConversion(this.inputCurrency, range.price);
      }
    });
  }
};

// Indexes - UPDATED with featured fields
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'price.cny': 1, 'price.usd': 1, 'price.bdt': 1 });
// NEW: Featured product indexes
ProductSchema.index({ featured: 1, featuredPriority: -1, createdAt: -1 });
ProductSchema.index({ featured: 1, viewCount: -1 });

const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
