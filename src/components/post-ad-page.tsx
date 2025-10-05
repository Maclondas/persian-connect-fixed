import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, ArrowRight, Upload, X, CreditCard, Search, ChevronDown, MapPin, Navigation, Loader2, Cloud, Database } from 'lucide-react';
import { 
  Car, Building, Building2, Briefcase, Wrench, Shirt, Smartphone, Heart, 
  Code, GraduationCap, Dumbbell, ChefHat, Plane, Calculator, Scale, 
  Stethoscope, CreditCard as CreditCardIcon, DollarSign, UtensilsCrossed, 
  ShoppingCart, Scissors, Palette, Languages, BookOpen, Music, MoreHorizontal 
} from 'lucide-react';
import { toast } from 'sonner';
import { stripeService, StripeService } from './services/stripe-service';
import { realDataService as dataService } from './services/real-data-service';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';

interface NavigateFunction {
  (page: 'home' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'vehicles' | 'digital-goods' | 'real-estate' | 'commercial-property' | 'jobs' | 'services' | 'fashion' | 'pets' | 'it-web-services' | 'courses-training' | 'driving-lessons' | 'fitness-coach' | 'food-catering' | 'travel-agency' | 'accountancy' | 'legal' | 'medical' | 'visa' | 'restaurant-equipment' | 'barber-hairdresser' | 'tattoo-services' | 'interpreter-translation', params?: { adId?: string; chatId?: string }): void;
}

interface PostAdPageProps {
  onNavigate: NavigateFunction;
}

// All categories from your marketplace
const categories = [
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'real-estate', name: 'Real Estate', icon: Building },
  { id: 'commercial-property', name: 'Commercial Property', icon: Building2 },
  { id: 'jobs', name: 'Recruitments & Jobs', icon: Briefcase },
  { id: 'services', name: 'Services', icon: Wrench },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'digital-goods', name: 'Digital Goods (Electronics)', icon: Smartphone },
  { id: 'pets', name: 'Pets & Animals', icon: Heart },
  { id: 'it-web-services', name: 'IT & Web Services', icon: Code },
  { id: 'courses-training', name: 'Courses & Training', icon: BookOpen },
  { id: 'driving-lessons', name: 'Driving Lessons', icon: Car },
  { id: 'music-lessons', name: 'Music Lessons', icon: Music },
  { id: 'fitness-coach', name: 'Fitness Coach', icon: Dumbbell },
  { id: 'food-catering', name: 'Food & Catering', icon: ChefHat },
  { id: 'travel-agency', name: 'Travel Agency', icon: Plane },
  { id: 'accountancy', name: 'Accountancy', icon: Calculator },
  { id: 'legal', name: 'Solicitor & Legal Services', icon: Scale },
  { id: 'medical', name: 'Doctors & Beauty Clinics', icon: Stethoscope },
  { id: 'visa', name: 'Visa Services', icon: CreditCardIcon },
  { id: 'currency-exchange', name: 'Currency Exchange', icon: DollarSign },
  { id: 'restaurant-equipment', name: 'Takeaway & Restaurant Equipment', icon: UtensilsCrossed },
  { id: 'supermarket-wholesalers', name: 'Supermarkets & Wholesalers', icon: ShoppingCart },
  { id: 'barber-hairdresser', name: 'Barber Shop & Hairdresser', icon: Scissors },
  { id: 'tattoo-services', name: 'Tattoo Services', icon: Palette },
  { id: 'interpreter-translation', name: 'Interpreter & Translation Services', icon: Languages },
  { id: 'other', name: 'Other', icon: MoreHorizontal }
];

// Comprehensive subcategories for all categories
const subcategories = {
  'vehicles': [
    'Cars for Sale', 'Car Rentals', 'Motorcycles & Bicycles', 'Boats & Marine',
    'RVs & Campers', 'Commercial Vehicles', 'Auto Parts & Accessories', 
    'Auto Services & Repair', 'Parking Spaces', 'Other Vehicles'
  ],
  'real-estate': [
    'Apartments for Rent', 'Houses for Rent', 'Villas for Rent', 'Studios for Rent',
    'Rooms for Rent', 'Apartments for Sale', 'Houses for Sale', 'Villas for Sale',
    'Land & Plots', 'Property Management', 'Other Real Estate'
  ],
  'commercial-property': [
    'Office Spaces', 'Retail Shops', 'Warehouses', 'Restaurants & Cafes',
    'Hotels & Hospitality', 'Industrial Properties', 'Land & Commercial Plots',
    'Coworking Spaces', 'Other Commercial'
  ],
  'jobs': [
    'Full-time Positions', 'Part-time Jobs', 'Freelance & Contract', 'Internships',
    'Remote Work', 'Sales & Marketing', 'IT & Technology', 'Healthcare',
    'Education & Training', 'Customer Service', 'Management', 'Other Jobs'
  ],
  'services': [
    'Home Services', 'Cleaning Services', 'Maintenance & Repair', 'Moving & Storage',
    'Security Services', 'Event Services', 'Professional Services', 'Personal Services',
    'Garden & Landscaping', 'Other Services'
  ],
  'fashion': [
    'Men\'s Clothing', 'Women\'s Clothing', 'Children\'s Clothing', 'Shoes & Footwear',
    'Bags & Accessories', 'Jewelry & Watches', 'Traditional Wear', 'Designer Items',
    'Vintage Fashion', 'Other Fashion'
  ],
  'digital-goods': [
    'Mobile Phones', 'Laptops & Computers', 'Tablets', 'Gaming Consoles & Games',
    'Audio & Headphones', 'Cameras & Photography', 'Smart Home Devices',
    'Accessories & Cables', 'Software & Apps', 'Other Electronics'
  ],
  'pets': [
    'Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Small Animals',
    'Pet Food & Supplies', 'Pet Services', 'Pet Accessories', 'Veterinary Services',
    'Other Pets'
  ],
  'it-web-services': [
    'Website Development', 'Mobile App Development', 'Software Development',
    'SEO & Digital Marketing', 'Graphic Design', 'Data Entry & Admin',
    'IT Support & Maintenance', 'Cybersecurity', 'Cloud Services', 'Other IT Services'
  ],
  'courses-training': [
    'Professional Certifications', 'Technical Skills', 'Business Training',
    'Creative Arts', 'Computer Courses', 'Language Courses', 'Online Training',
    'Workshops & Seminars', 'Other Training'
  ],
  'driving-lessons': [
    'Car Driving Lessons', 'Motorcycle Lessons', 'Truck Driving', 'Defensive Driving',
    'Refresher Courses', 'Test Preparation', 'Advanced Driving', 'Other Driving'
  ],
  'music-lessons': [
    'Piano Lessons', 'Guitar Lessons', 'Vocal Training', 'Music Theory',
    'Instrument Rental', 'Music Production', 'DJ Services', 'Other Music'
  ],
  'fitness-coach': [
    'Personal Training', 'Group Fitness Classes', 'Nutrition Coaching',
    'Sports Coaching', 'Yoga & Pilates', 'Martial Arts', 'Weight Training',
    'Cardio Training', 'Other Fitness'
  ],
  'food-catering': [
    'Catering Services', 'Home Cooking', 'Baking & Desserts', 'Event Catering',
    'Meal Prep Services', 'Restaurant Services', 'Food Delivery', 'Other Food'
  ],
  'travel-agency': [
    'Flight Bookings', 'Hotel Reservations', 'Tour Packages', 'Visa Assistance',
    'Travel Insurance', 'Car Rentals', 'Cruise Bookings', 'Adventure Travel',
    'Business Travel', 'Other Travel'
  ],
  'accountancy': [
    'Tax Preparation', 'Bookkeeping', 'Financial Consulting', 'Audit Services',
    'Business Registration', 'Payroll Services', 'Financial Planning', 'Other Accounting'
  ],
  'legal': [
    'Immigration Law', 'Family Law', 'Business Law', 'Real Estate Law',
    'Criminal Law', 'Document Preparation', 'Legal Consultation', 'Court Representation',
    'Contract Services', 'Other Legal'
  ],
  'medical': [
    'General Practice', 'Dental Services', 'Beauty & Cosmetic', 'Physiotherapy',
    'Mental Health', 'Alternative Medicine', 'Home Care', 'Medical Equipment',
    'Health Consultation', 'Other Medical'
  ],
  'visa': [
    'Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa',
    'Family Visa', 'Transit Visa', 'Visa Consultation', 'Document Preparation',
    'Other Visa Services'
  ],
  'currency-exchange': [
    'USD Exchange', 'EUR Exchange', 'GBP Exchange', 'SAR Exchange',
    'AED Exchange', 'TRY Exchange', 'Money Transfer', 'Other Currencies'
  ],
  'restaurant-equipment': [
    'Kitchen Equipment', 'Dining Furniture', 'Refrigeration', 'Cooking Appliances',
    'POS Systems', 'Cleaning Equipment', 'Food Display', 'Other Equipment'
  ],
  'supermarket-wholesalers': [
    'Groceries & Food', 'Beverages', 'Household Items', 'Personal Care',
    'Bulk Supplies', 'Frozen Foods', 'Import/Export', 'Other Wholesale'
  ],
  'barber-hairdresser': [
    'Men\'s Haircuts', 'Women\'s Haircuts', 'Hair Coloring', 'Hair Treatments',
    'Beard Grooming', 'Bridal Services', 'Hair Extensions', 'Other Hair Services'
  ],
  'tattoo-services': [
    'Custom Tattoos', 'Cover-up Tattoos', 'Piercing Services', 'Tattoo Removal',
    'Henna Art', 'Tattoo Design', 'Aftercare Products', 'Other Tattoo Services'
  ],
  'interpreter-translation': [
    'Document Translation', 'Live Interpretation', 'Legal Translation',
    'Medical Translation', 'Website Localization', 'Certified Translation',
    'Voice Over Services', 'Other Translation'
  ],
  'other': [
    'Miscellaneous Items', 'Collectibles', 'Art & Crafts', 'Books & Media',
    'Sports Equipment', 'Tools & Equipment', 'Industrial Items', 'Other Services'
  ]
};

// Location data - same as location-picker-modal
const COUNTRIES = [
  { id: 'all', name: 'All Countries', namePersian: 'همه کشورها' },
  { id: 'uk', name: 'United Kingdom', namePersian: 'بریتانیا' },
  { id: 'usa', name: 'United States', namePersian: 'ایالات متحده' },
  { id: 'sweden', name: 'Sweden', namePersian: 'سوئد' },
  { id: 'spain', name: 'Spain', namePersian: 'اسپانیا' },
  { id: 'italy', name: 'Italy', namePersian: 'ایتالیا' },
  { id: 'germany', name: 'Germany', namePersian: 'آلمان' },
  { id: 'netherlands', name: 'Netherlands', namePersian: 'هلند' },
  { id: 'france', name: 'France', namePersian: 'فرانسه' },
  { id: 'romania', name: 'Romania', namePersian: 'رومانی' },
  { id: 'portugal', name: 'Portugal', namePersian: 'پرتغال' },
  { id: 'uae', name: 'United Arab Emirates', namePersian: 'امارات متحده عربی' },
  { id: 'canada', name: 'Canada', namePersian: 'کانادا' },
  { id: 'qatar', name: 'Qatar', namePersian: 'قطر' },
  { id: 'kuwait', name: 'Kuwait', namePersian: 'کویت' },
  { id: 'turkey', name: 'Turkey', namePersian: 'ترکیه' },
  { id: 'thailand', name: 'Thailand', namePersian: 'تایلند' },
  { id: 'greece', name: 'Greece', namePersian: 'یونان' },
  { id: 'norway', name: 'Norway', namePersian: 'نروژ' },
  { id: 'finland', name: 'Finland', namePersian: 'فنلاند' },
  { id: 'australia', name: 'Australia', namePersian: 'استرالیا' },
  { id: 'mexico', name: 'Mexico', namePersian: 'مکزیک' }
];

const CITIES: { [key: string]: { id: string; name: string; namePersian: string }[] } = {
  all: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' }
  ],
  uk: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'aberdeen', name: 'Aberdeen', namePersian: 'آبردین' },
    { id: 'aberystwyth', name: 'Aberystwyth', namePersian: 'آبریستویث' },
    { id: 'aldershot', name: 'Aldershot', namePersian: 'آلدرشات' },
    { id: 'armagh', name: 'Armagh', namePersian: 'آرماغ' },
    { id: 'ashford', name: 'Ashford', namePersian: 'اشفورد' },
    { id: 'aylesbury', name: 'Aylesbury', namePersian: 'آیلزبری' },
    { id: 'ayr', name: 'Ayr', namePersian: 'آیر' },
    { id: 'ballymena', name: 'Ballymena', namePersian: 'بالیمنا' },
    { id: 'bangor', name: 'Bangor', namePersian: 'بانگور' },
    { id: 'banbury', name: 'Banbury', namePersian: 'بانبری' },
    { id: 'barnsley', name: 'Barnsley', namePersian: 'بارنزلی' },
    { id: 'barrow-in-furness', name: 'Barrow-in-Furness', namePersian: 'بارو این فرنس' },
    { id: 'barry', name: 'Barry', namePersian: 'بری' },
    { id: 'basildon', name: 'Basildon', namePersian: 'بازیلدون' },
    { id: 'basingstoke', name: 'Basingstoke', namePersian: 'بازینگستوک' },
    { id: 'bath', name: 'Bath', namePersian: 'باث' },
    { id: 'bedford', name: 'Bedford', namePersian: 'بدفورد' },
    { id: 'belfast', name: 'Belfast', namePersian: 'بلفاست' },
    { id: 'beverley', name: 'Beverley', namePersian: 'بورلی' },
    { id: 'birkenhead', name: 'Birkenhead', namePersian: 'برکنهد' },
    { id: 'birmingham', name: 'Birmingham', namePersian: 'بیرمنگهام' },
    { id: 'blackburn', name: 'Blackburn', namePersian: 'بلکبرن' },
    { id: 'blackpool', name: 'Blackpool', namePersian: 'بلکپول' },
    { id: 'bognor-regis', name: 'Bognor Regis', namePersian: 'بوگنور ریگیس' },
    { id: 'bolton', name: 'Bolton', namePersian: 'بولتون' },
    { id: 'bournemouth', name: 'Bournemouth', namePersian: 'بورنموث' },
    { id: 'bracknell', name: 'Bracknell', namePersian: 'برکنل' },
    { id: 'bradford', name: 'Bradford', namePersian: 'برادفورد' },
    { id: 'bridgend', name: 'Bridgend', namePersian: 'بریجند' },
    { id: 'bridlington', name: 'Bridlington', namePersian: 'بریدلینگتون' },
    { id: 'brighton-and-hove', name: 'Brighton and Hove', namePersian: 'برایتون اند هو' },
    { id: 'bristol', name: 'Bristol', namePersian: 'بریستول' },
    { id: 'burnley', name: 'Burnley', namePersian: 'برنلی' },
    { id: 'burton-upon-trent', name: 'Burton upon Trent', namePersian: 'برتون آپون ترنت' },
    { id: 'bury', name: 'Bury', namePersian: 'بری' },
    { id: 'bury-st-edmunds', name: 'Bury St Edmunds', namePersian: 'بری سنت ادموندز' },
    { id: 'caerphilly', name: 'Caerphilly', namePersian: 'کارفیلی' },
    { id: 'cambridge', name: 'Cambridge', namePersian: 'کمبریج' },
    { id: 'camden', name: 'Camden', namePersian: 'کمدن' },
    { id: 'canterbury', name: 'Canterbury', namePersian: 'کنتربری' },
    { id: 'cardiff', name: 'Cardiff', namePersian: 'کاردیف' },
    { id: 'carlisle', name: 'Carlisle', namePersian: 'کارلایل' },
    { id: 'carrickfergus', name: 'Carrickfergus', namePersian: 'کریکفرگوس' },
    { id: 'chatham', name: 'Chatham', namePersian: 'چتم' },
    { id: 'chelmsford', name: 'Chelmsford', namePersian: 'چلمزفورد' },
    { id: 'cheltenham', name: 'Cheltenham', namePersian: 'چلتنهم' },
    { id: 'chester', name: 'Chester', namePersian: 'چستر' },
    { id: 'chesterfield', name: 'Chesterfield', namePersian: 'چسترفیلد' },
    { id: 'chichester', name: 'Chichester', namePersian: 'چیچستر' },
    { id: 'coleraine', name: 'Coleraine', namePersian: 'کولرین' },
    { id: 'colchester', name: 'Colchester', namePersian: 'کولچستر' },
    { id: 'coventry', name: 'Coventry', namePersian: 'کاونتری' },
    { id: 'craigavon', name: 'Craigavon', namePersian: 'کریگاون' },
    { id: 'crawley', name: 'Crawley', namePersian: 'کرالی' },
    { id: 'crewe', name: 'Crewe', namePersian: 'کرو' },
    { id: 'croydon', name: 'Croydon', namePersian: 'کرویدون' },
    { id: 'cumbernauld', name: 'Cumbernauld', namePersian: 'کامبرنولد' },
    { id: 'cwmbran', name: 'Cwmbran', namePersian: 'کومبران' },
    { id: 'darlington', name: 'Darlington', namePersian: 'دارلینگتون' },
    { id: 'derby', name: 'Derby', namePersian: 'دربی' },
    { id: 'derry-londonderry', name: 'Derry (Londonderry)', namePersian: 'دری (لندندری)' },
    { id: 'doncaster', name: 'Doncaster', namePersian: 'دونکستر' },
    { id: 'droitwich-spa', name: 'Droitwich Spa', namePersian: 'درویچ اسپا' },
    { id: 'dudley', name: 'Dudley', namePersian: 'دادلی' },
    { id: 'dunfermline', name: 'Dunfermline', namePersian: 'دانفرملاین' },
    { id: 'dunstable', name: 'Dunstable', namePersian: 'دانستبل' },
    { id: 'durham', name: 'Durham', namePersian: 'دورهم' },
    { id: 'east-kilbride', name: 'East Kilbride', namePersian: 'ایست کیلبراید' },
    { id: 'eastbourne', name: 'Eastbourne', namePersian: 'ایستبورن' },
    { id: 'edinburgh', name: 'Edinburgh', namePersian: 'ادینبرو' },
    { id: 'ely', name: 'Ely', namePersian: 'الی' },
    { id: 'epsom', name: 'Epsom', namePersian: 'اپسوم' },
    { id: 'exeter', name: 'Exeter', namePersian: 'اکستر' },
    { id: 'gateshead', name: 'Gateshead', namePersian: 'گیتسهد' },
    { id: 'gillingham', name: 'Gillingham', namePersian: 'گیلینگهم' },
    { id: 'glasgow', name: 'Glasgow', namePersian: 'گلاسگو' },
    { id: 'gloucester', name: 'Gloucester', namePersian: 'گلاستر' },
    { id: 'great-yarmouth', name: 'Great Yarmouth', namePersian: 'گریت یارموث' },
    { id: 'greenock', name: 'Greenock', namePersian: 'گرینوک' },
    { id: 'grimsby', name: 'Grimsby', namePersian: 'گریمزبی' },
    { id: 'guildford', name: 'Guildford', namePersian: 'گیلدفورد' },
    { id: 'halifax', name: 'Halifax', namePersian: 'هلیفکس' },
    { id: 'halton', name: 'Halton', namePersian: 'هلتون' },
    { id: 'hamilton', name: 'Hamilton', namePersian: 'همیلتون' },
    { id: 'harlow', name: 'Harlow', namePersian: 'هارلو' },
    { id: 'harrogate', name: 'Harrogate', namePersian: 'هاروگیت' },
    { id: 'hartlepool', name: 'Hartlepool', namePersian: 'هارتلپول' },
    { id: 'hastings', name: 'Hastings', namePersian: 'هستینگز' },
    { id: 'hemel-hempstead', name: 'Hemel Hempstead', namePersian: 'همل همپستد' },
    { id: 'hereford', name: 'Hereford', namePersian: 'هرفورد' },
    { id: 'high-wycombe', name: 'High Wycombe', namePersian: 'های ویکوم' },
    { id: 'hinckley', name: 'Hinckley', namePersian: 'هینکلی' },
    { id: 'huddersfield', name: 'Huddersfield', namePersian: 'هادرزفیلد' },
    { id: 'huntingdon', name: 'Huntingdon', namePersian: 'هانتینگدون' },
    { id: 'inverness', name: 'Inverness', namePersian: 'اینورنس' },
    { id: 'ipswich', name: 'Ipswich', namePersian: 'ایپسویچ' },
    { id: 'islington', name: 'Islington', namePersian: 'ایزلینگتون' },
    { id: 'kendal', name: 'Kendal', namePersian: 'کندال' },
    { id: 'kettering', name: 'Kettering', namePersian: 'کترینگ' },
    { id: 'kilmarnock', name: 'Kilmarnock', namePersian: 'کیلمارنوک' },
    { id: 'kings-lynn', name: "King's Lynn", namePersian: 'کینگز لین' },
    { id: 'kingston-upon-hull', name: 'Kingston upon Hull', namePersian: 'کینگستون آپون هول' },
    { id: 'kingston-upon-thames', name: 'Kingston upon Thames', namePersian: 'کینگستون آپون تیمز' },
    { id: 'lancaster', name: 'Lancaster', namePersian: 'لنکستر' },
    { id: 'leeds', name: 'Leeds', namePersian: 'لیدز' },
    { id: 'leicester', name: 'Leicester', namePersian: 'لستر' },
    { id: 'lichfield', name: 'Lichfield', namePersian: 'لیچفیلد' },
    { id: 'lincoln', name: 'Lincoln', namePersian: 'لینکلن' },
    { id: 'lisburn', name: 'Lisburn', namePersian: 'لیزبرن' },
    { id: 'liverpool', name: 'Liverpool', namePersian: 'لیورپول' },
    { id: 'livingston', name: 'Livingston', namePersian: 'لیوینگستون' },
    { id: 'llanelli', name: 'Llanelli', namePersian: 'لانلی' },
    { id: 'london', name: 'London', namePersian: 'لندن' },
    { id: 'loughborough', name: 'Loughborough', namePersian: 'لافبرو' },
    { id: 'lowestoft', name: 'Lowestoft', namePersian: 'لوستافت' },
    { id: 'luton', name: 'Luton', namePersian: 'لوتون' },
    { id: 'maidstone', name: 'Maidstone', namePersian: 'میدستون' },
    { id: 'maidenhead', name: 'Maidenhead', namePersian: 'میدنهد' },
    { id: 'manchester', name: 'Manchester', namePersian: 'منچستر' },
    { id: 'mansfield', name: 'Mansfield', namePersian: 'منزفیلد' },
    { id: 'merthyr-tydfil', name: 'Merthyr Tydfil', namePersian: 'مرثیر تیدفیل' },
    { id: 'middlesbrough', name: 'Middlesbrough', namePersian: 'میدلزبرو' },
    { id: 'milton-keynes', name: 'Milton Keynes', namePersian: 'میلتون کینز' },
    { id: 'neath', name: 'Neath', namePersian: 'نیث' },
    { id: 'newark-on-trent', name: 'Newark-on-Trent', namePersian: 'نیوآرک آن ترنت' },
    { id: 'newcastle-upon-tyne', name: 'Newcastle upon Tyne', namePersian: 'نیوکاسل آپون تاین' },
    { id: 'newport', name: 'Newport', namePersian: 'نیوپورت' },
    { id: 'newry', name: 'Newry', namePersian: 'نیوری' },
    { id: 'newtownabbey', name: 'Newtownabbey', namePersian: 'نیوتاون ابی' },
    { id: 'newtownards', name: 'Newtownards', namePersian: 'نیوتاون آردز' },
    { id: 'northampton', name: 'Northampton', namePersian: 'نورثمپتون' },
    { id: 'norwich', name: 'Norwich', namePersian: 'نوریچ' },
    { id: 'nottingham', name: 'Nottingham', namePersian: 'ناتینگهم' },
    { id: 'nuneaton', name: 'Nuneaton', namePersian: 'نانیتون' },
    { id: 'oldham', name: 'Oldham', namePersian: 'اولدهم' },
    { id: 'oxford', name: 'Oxford', namePersian: 'آکسفورد' },
    { id: 'paisley', name: 'Paisley', namePersian: 'پیزلی' },
    { id: 'paignton', name: 'Paignton', namePersian: 'پینگتون' },
    { id: 'penzance', name: 'Penzance', namePersian: 'پنزانس' },
    { id: 'perth', name: 'Perth', namePersian: 'پرث' },
    { id: 'peterborough', name: 'Peterborough', namePersian: 'پیتربرو' },
    { id: 'plymouth', name: 'Plymouth', namePersian: 'پلیموث' },
    { id: 'poole', name: 'Poole', namePersian: 'پول' },
    { id: 'portsmouth', name: 'Portsmouth', namePersian: 'پورتسموث' },
    { id: 'preston', name: 'Preston', namePersian: 'پرستون' },
    { id: 'reading', name: 'Reading', namePersian: 'ریدینگ' },
    { id: 'redditch', name: 'Redditch', namePersian: 'ردیچ' },
    { id: 'ripon', name: 'Ripon', namePersian: 'ریپون' },
    { id: 'rochdale', name: 'Rochdale', namePersian: 'روچدیل' },
    { id: 'rotherham', name: 'Rotherham', namePersian: 'راترهم' },
    { id: 'rugby', name: 'Rugby', namePersian: 'راگبی' },
    { id: 'salford', name: 'Salford', namePersian: 'سالفورد' },
    { id: 'salisbury', name: 'Salisbury', namePersian: 'سالزبری' },
    { id: 'scarborough', name: 'Scarborough', namePersian: 'اسکاربرو' },
    { id: 'scunthorpe', name: 'Scunthorpe', namePersian: 'اسکانتورپ' },
    { id: 'sheffield', name: 'Sheffield', namePersian: 'شفیلد' },
    { id: 'slough', name: 'Slough', namePersian: 'اسلاف' },
    { id: 'solihull', name: 'Solihull', namePersian: 'سولیهول' },
    { id: 'south-shields', name: 'South Shields', namePersian: 'ساوث شیلدز' },
    { id: 'southampton', name: 'Southampton', namePersian: 'ساوثمپتون' },
    { id: 'southend-on-sea', name: 'Southend-on-Sea', namePersian: 'ساوثند آن سی' },
    { id: 'southport', name: 'Southport', namePersian: 'ساوثپورت' },
    { id: 'st-albans', name: 'St Albans', namePersian: 'سنت آلبانز' },
    { id: 'st-asaph', name: 'St Asaph', namePersian: 'سنت آساف' },
    { id: 'st-austell', name: 'St Austell', namePersian: 'سنت آوستل' },
    { id: 'st-davids', name: 'St Davids', namePersian: 'سنت دیویدز' },
    { id: 'st-helens', name: 'St Helens', namePersian: 'سنت هلنز' },
    { id: 'stafford', name: 'Stafford', namePersian: 'استافورد' },
    { id: 'stevenage', name: 'Stevenage', namePersian: 'استیونیج' },
    { id: 'stirling', name: 'Stirling', namePersian: 'استرلینگ' },
    { id: 'stockport', name: 'Stockport', namePersian: 'استاکپورت' },
    { id: 'stockton-on-tees', name: 'Stockton-on-Tees', namePersian: 'استاکتون آن تیز' },
    { id: 'stoke-on-trent', name: 'Stoke-on-Trent', namePersian: 'استوک آن ترنت' },
    { id: 'stroud', name: 'Stroud', namePersian: 'استراود' },
    { id: 'sunderland', name: 'Sunderland', namePersian: 'ساندرلند' },
    { id: 'swadlincote', name: 'Swadlincote', namePersian: 'سوادلینکوت' },
    { id: 'swansea', name: 'Swansea', namePersian: 'سوانسی' },
    { id: 'swindon', name: 'Swindon', namePersian: 'سویندون' },
    { id: 'taunton', name: 'Taunton', namePersian: 'تونتون' },
    { id: 'telford', name: 'Telford', namePersian: 'تلفورد' },
    { id: 'torquay', name: 'Torquay', namePersian: 'تورکی' },
    { id: 'trowbridge', name: 'Trowbridge', namePersian: 'تروبریج' },
    { id: 'truro', name: 'Truro', namePersian: 'ترورو' },
    { id: 'wakefield', name: 'Wakefield', namePersian: 'ویکفیلد' },
    { id: 'warrington', name: 'Warrington', namePersian: 'وارینگتون' },
    { id: 'warwick', name: 'Warwick', namePersian: 'واریک' },
    { id: 'watford', name: 'Watford', namePersian: 'واتفورد' },
    { id: 'wellingborough', name: 'Wellingborough', namePersian: 'ولینگبرو' },
    { id: 'wells', name: 'Wells', namePersian: 'ولز' },
    { id: 'westminster', name: 'Westminster', namePersian: 'وستمینستر' },
    { id: 'weston-super-mare', name: 'Weston-super-Mare', namePersian: 'وستون سوپر مر' },
    { id: 'weymouth', name: 'Weymouth', namePersian: 'ویموث' },
    { id: 'wigan', name: 'Wigan', namePersian: 'ویگان' },
    { id: 'winchester', name: 'Winchester', namePersian: 'وینچستر' },
    { id: 'windsor', name: 'Windsor', namePersian: 'وینزور' },
    { id: 'woking', name: 'Woking', namePersian: 'وکینگ' },
    { id: 'wolverhampton', name: 'Wolverhampton', namePersian: 'ولورهمپتون' },
    { id: 'worcester', name: 'Worcester', namePersian: 'ورسستر' },
    { id: 'worthing', name: 'Worthing', namePersian: 'ورثینگ' },
    { id: 'wrexham', name: 'Wrexham', namePersian: 'رکسهم' },
    { id: 'york', name: 'York', namePersian: 'یورک' }
  ],
  'usa': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'new-york', name: 'New York', namePersian: 'نیویورک' },
    { id: 'los-angeles', name: 'Los Angeles', namePersian: 'لس آنجلس' },
    { id: 'chicago', name: 'Chicago', namePersian: 'شیکاگو' },
    { id: 'houston', name: 'Houston', namePersian: 'هیوستون' },
    { id: 'philadelphia', name: 'Philadelphia', namePersian: 'فیلادلفیا' },
    { id: 'phoenix', name: 'Phoenix', namePersian: 'فینیکس' },
    { id: 'san-antonio', name: 'San Antonio', namePersian: 'سن آنتونیو' },
    { id: 'san-diego', name: 'San Diego', namePersian: 'سن دیگو' },
    { id: 'dallas', name: 'Dallas', namePersian: 'دالاس' },
    { id: 'san-jose', name: 'San Jose', namePersian: 'سن خوزه' },
    { id: 'austin', name: 'Austin', namePersian: 'آستین' },
    { id: 'jacksonville', name: 'Jacksonville', namePersian: 'جکسونویل' },
    { id: 'fort-worth', name: 'Fort Worth', namePersian: 'فورت ورث' },
    { id: 'columbus', name: 'Columbus', namePersian: 'کلمبوس' },
    { id: 'charlotte', name: 'Charlotte', namePersian: 'شارلوت' }
  ],
  'sweden': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'stockholm', name: 'Stockholm', namePersian: 'استکهلم' },
    { id: 'gothenburg', name: 'Gothenburg', namePersian: 'گوتنبرگ' },
    { id: 'malmo', name: 'Malmö', namePersian: 'مالمو' },
    { id: 'uppsala', name: 'Uppsala', namePersian: 'اوپسالا' },
    { id: 'vasteras', name: 'Västerås', namePersian: 'وسترش' },
    { id: 'orebro', name: 'Örebro', namePersian: 'اوربرو' },
    { id: 'linkoping', name: 'Linköping', namePersian: 'لینچوپینگ' },
    { id: 'helsingborg', name: 'Helsingborg', namePersian: 'هلسینبورگ' },
    { id: 'jonkoping', name: 'Jönköping', namePersian: 'ینچوپینگ' },
    { id: 'norrkoping', name: 'Norrköping', namePersian: 'نورچوپینگ' }
  ],
  'spain': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'madrid', name: 'Madrid', namePersian: 'مادرید' },
    { id: 'barcelona', name: 'Barcelona', namePersian: 'بارسلونا' },
    { id: 'valencia', name: 'Valencia', namePersian: 'والنسیا' },
    { id: 'seville', name: 'Seville', namePersian: 'سویل' },
    { id: 'zaragoza', name: 'Zaragoza', namePersian: 'ساراگوسا' },
    { id: 'malaga', name: 'Málaga', namePersian: 'مالاگا' },
    { id: 'murcia', name: 'Murcia', namePersian: 'مورسیا' },
    { id: 'palma', name: 'Palma', namePersian: 'پالما' },
    { id: 'las-palmas', name: 'Las Palmas', namePersian: 'لاس پالماس' },
    { id: 'bilbao', name: 'Bilbao', namePersian: 'بیلبائو' }
  ],
  'italy': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'rome', name: 'Rome', namePersian: 'رم' },
    { id: 'milan', name: 'Milan', namePersian: 'میلان' },
    { id: 'naples', name: 'Naples', namePersian: 'ناپل' },
    { id: 'turin', name: 'Turin', namePersian: 'تورین' },
    { id: 'palermo', name: 'Palermo', namePersian: 'پالرمو' },
    { id: 'genoa', name: 'Genoa', namePersian: 'جنوا' },
    { id: 'bologna', name: 'Bologna', namePersian: 'بولونیا' },
    { id: 'florence', name: 'Florence', namePersian: 'فلورانس' },
    { id: 'bari', name: 'Bari', namePersian: 'باری' },
    { id: 'catania', name: 'Catania', namePersian: 'کاتانیا' }
  ],
  'germany': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'berlin', name: 'Berlin', namePersian: 'برلین' },
    { id: 'hamburg', name: 'Hamburg', namePersian: 'هامبورگ' },
    { id: 'munich', name: 'Munich', namePersian: 'مونیخ' },
    { id: 'cologne', name: 'Cologne', namePersian: 'کلن' },
    { id: 'frankfurt', name: 'Frankfurt', namePersian: 'فرانکفورت' },
    { id: 'stuttgart', name: 'Stuttgart', namePersian: 'اشتوتگارت' },
    { id: 'dusseldorf', name: 'Düsseldorf', namePersian: 'دوسلدورف' },
    { id: 'dortmund', name: 'Dortmund', namePersian: 'دورتموند' },
    { id: 'essen', name: 'Essen', namePersian: 'اسن' },
    { id: 'leipzig', name: 'Leipzig', namePersian: 'لایپزیگ' }
  ],
  'netherlands': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'amsterdam', name: 'Amsterdam', namePersian: 'آمستردام' },
    { id: 'rotterdam', name: 'Rotterdam', namePersian: 'روتردام' },
    { id: 'the-hague', name: 'The Hague', namePersian: 'لاهه' },
    { id: 'utrecht', name: 'Utrecht', namePersian: 'اوترخت' },
    { id: 'eindhoven', name: 'Eindhoven', namePersian: 'آیندهوون' },
    { id: 'tilburg', name: 'Tilburg', namePersian: 'تیلبورگ' },
    { id: 'groningen', name: 'Groningen', namePersian: 'خرونینگن' },
    { id: 'almere', name: 'Almere', namePersian: 'آلمره' },
    { id: 'breda', name: 'Breda', namePersian: 'بردا' },
    { id: 'nijmegen', name: 'Nijmegen', namePersian: 'نایمگن' }
  ],
  'france': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'paris', name: 'Paris', namePersian: 'پاریس' },
    { id: 'marseille', name: 'Marseille', namePersian: 'مارسی' },
    { id: 'lyon', name: 'Lyon', namePersian: 'لیون' },
    { id: 'toulouse', name: 'Toulouse', namePersian: 'تولوز' },
    { id: 'nice', name: 'Nice', namePersian: 'نیس' },
    { id: 'nantes', name: 'Nantes', namePersian: 'نانت' },
    { id: 'strasbourg', name: 'Strasbourg', namePersian: 'استراسبورگ' },
    { id: 'montpellier', name: 'Montpellier', namePersian: 'مونپلیه' },
    { id: 'bordeaux', name: 'Bordeaux', namePersian: 'بوردو' },
    { id: 'lille', name: 'Lille', namePersian: 'لیل' }
  ],
  'romania': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'bucharest', name: 'Bucharest', namePersian: 'بخارست' },
    { id: 'cluj-napoca', name: 'Cluj-Napoca', namePersian: 'کلوژ ناپوکا' },
    { id: 'timisoara', name: 'Timișoara', namePersian: 'تیمیشوارا' },
    { id: 'iasi', name: 'Iași', namePersian: 'یاش' },
    { id: 'constanta', name: 'Constanța', namePersian: 'کنستانتا' },
    { id: 'craiova', name: 'Craiova', namePersian: 'کرایوا' },
    { id: 'brasov', name: 'Brașov', namePersian: 'براشوف' },
    { id: 'galati', name: 'Galați', namePersian: 'گالاتی' },
    { id: 'ploiesti', name: 'Ploiești', namePersian: 'پلویشتی' },
    { id: 'oradea', name: 'Oradea', namePersian: 'اورادئا' }
  ],
  'portugal': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'lisbon', name: 'Lisbon', namePersian: 'لیسبون' },
    { id: 'porto', name: 'Porto', namePersian: 'پورتو' },
    { id: 'vila-nova-de-gaia', name: 'Vila Nova de Gaia', namePersian: 'ویلا نووا د گایا' },
    { id: 'amadora', name: 'Amadora', namePersian: 'آمادورا' },
    { id: 'braga', name: 'Braga', namePersian: 'براگا' },
    { id: 'funchal', name: 'Funchal', namePersian: 'فونشال' },
    { id: 'coimbra', name: 'Coimbra', namePersian: 'کویمبرا' },
    { id: 'setubal', name: 'Setúbal', namePersian: 'ستوبال' },
    { id: 'almada', name: 'Almada', namePersian: 'آلمادا' },
    { id: 'agualva-cacem', name: 'Agualva-Cacém', namePersian: 'آگوالوا کاسم' }
  ],
  'uae': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'dubai', name: 'Dubai', namePersian: 'دبی' },
    { id: 'abu-dhabi', name: 'Abu Dhabi', namePersian: 'ابوظبی' },
    { id: 'sharjah', name: 'Sharjah', namePersian: 'شارجه' },
    { id: 'al-ain', name: 'Al Ain', namePersian: 'العین' },
    { id: 'ajman', name: 'Ajman', namePersian: 'عجمان' },
    { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', namePersian: 'رأس الخیمه' },
    { id: 'fujairah', name: 'Fujairah', namePersian: 'فجیره' },
    { id: 'umm-al-quwain', name: 'Umm Al Quwain', namePersian: 'ام القیوین' },
    { id: 'khor-fakkan', name: 'Khor Fakkan', namePersian: 'خورفکان' },
    { id: 'kalba', name: 'Kalba', namePersian: 'کلبا' }
  ],
  'canada': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'toronto', name: 'Toronto', namePersian: 'تورنتو' },
    { id: 'montreal', name: 'Montreal', namePersian: 'مونترال' },
    { id: 'vancouver', name: 'Vancouver', namePersian: 'ونکوور' },
    { id: 'calgary', name: 'Calgary', namePersian: 'کلگری' },
    { id: 'edmonton', name: 'Edmonton', namePersian: 'ادمونتون' },
    { id: 'ottawa', name: 'Ottawa', namePersian: 'اتاوا' },
    { id: 'winnipeg', name: 'Winnipeg', namePersian: 'وینیپگ' },
    { id: 'quebec-city', name: 'Quebec City', namePersian: 'شهر کبک' },
    { id: 'hamilton', name: 'Hamilton', namePersian: 'همیلتون' },
    { id: 'kitchener', name: 'Kitchener', namePersian: 'کیچنر' }
  ],
  'qatar': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'doha', name: 'Doha', namePersian: 'دوحه' },
    { id: 'al-rayyan', name: 'Al Rayyan', namePersian: 'الریان' },
    { id: 'umm-salal', name: 'Umm Salal', namePersian: 'ام صلال' },
    { id: 'al-wakrah', name: 'Al Wakrah', namePersian: 'الوکره' },
    { id: 'al-khor', name: 'Al Khor', namePersian: 'الخور' },
    { id: 'dukhan', name: 'Dukhan', namePersian: 'دخان' },
    { id: 'mesaieed', name: 'Mesaieed', namePersian: 'مسیعید' },
    { id: 'lusail', name: 'Lusail', namePersian: 'لوسیل' }
  ],
  'kuwait': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'kuwait-city', name: 'Kuwait City', namePersian: 'شهر کویت' },
    { id: 'hawalli', name: 'Hawalli', namePersian: 'حولی' },
    { id: 'as-salimiyah', name: 'As Salimiyah', namePersian: 'سالمیه' },
    { id: 'sabah-as-salim', name: 'Sabah as Salim', namePersian: 'صباح السالم' },
    { id: 'al-farwaniyah', name: 'Al Farwaniyah', namePersian: 'الفروانیه' },
    { id: 'al-ahmadi', name: 'Al Ahmadi', namePersian: 'الاحمدی' },
    { id: 'al-jahra', name: 'Al Jahra', namePersian: 'الجهراء' },
    { id: 'mubarak-al-kabeer', name: 'Mubarak Al Kabeer', namePersian: 'مبارک الکبیر' }
  ],
  'turkey': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'istanbul', name: 'Istanbul', namePersian: 'استانبول' },
    { id: 'ankara', name: 'Ankara', namePersian: 'آنکارا' },
    { id: 'izmir', name: 'Izmir', namePersian: 'ازمیر' },
    { id: 'bursa', name: 'Bursa', namePersian: 'بورسا' },
    { id: 'adana', name: 'Adana', namePersian: 'آدانا' },
    { id: 'gaziantep', name: 'Gaziantep', namePersian: 'غازی عنتاب' },
    { id: 'konya', name: 'Konya', namePersian: 'قونیه' },
    { id: 'antalya', name: 'Antalya', namePersian: 'آنتالیا' },
    { id: 'diyarbakir', name: 'Diyarbakır', namePersian: 'دیاربکر' },
    { id: 'mersin', name: 'Mersin', namePersian: 'مرسین' }
  ],
  'thailand': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'bangkok', name: 'Bangkok', namePersian: 'بانکوک' },
    { id: 'chiang-mai', name: 'Chiang Mai', namePersian: 'چیانگ مای' },
    { id: 'phuket', name: 'Phuket', namePersian: 'پوکت' },
    { id: 'pattaya', name: 'Pattaya', namePersian: 'پاتایا' },
    { id: 'khon-kaen', name: 'Khon Kaen', namePersian: 'خون کائن' },
    { id: 'hat-yai', name: 'Hat Yai', namePersian: 'هات یای' },
    { id: 'chiang-rai', name: 'Chiang Rai', namePersian: 'چیانگ رای' },
    { id: 'udon-thani', name: 'Udon Thani', namePersian: 'اودون تانی' },
    { id: 'nakhon-ratchasima', name: 'Nakhon Ratchasima', namePersian: 'ناخون راچاسیما' },
    { id: 'surat-thani', name: 'Surat Thani', namePersian: 'سورات تانی' }
  ],
  'greece': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'athens', name: 'Athens', namePersian: 'آتن' },
    { id: 'thessaloniki', name: 'Thessaloniki', namePersian: 'تسالونیکی' },
    { id: 'patras', name: 'Patras', namePersian: 'پاتراس' },
    { id: 'piraeus', name: 'Piraeus', namePersian: 'پیره آئوس' },
    { id: 'larissa', name: 'Larissa', namePersian: 'لاریسا' },
    { id: 'heraklion', name: 'Heraklion', namePersian: 'هراکلیون' },
    { id: 'peristeri', name: 'Peristeri', namePersian: 'پریستری' },
    { id: 'kallithea', name: 'Kallithea', namePersian: 'کالیتا' },
    { id: 'acharnes', name: 'Acharnes', namePersian: 'آخارنس' },
    { id: 'kalamaria', name: 'Kalamaria', namePersian: 'کالاماریا' }
  ],
  'norway': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'oslo', name: 'Oslo', namePersian: 'اسلو' },
    { id: 'bergen', name: 'Bergen', namePersian: 'برگن' },
    { id: 'stavanger', name: 'Stavanger', namePersian: 'استاوانگر' },
    { id: 'trondheim', name: 'Trondheim', namePersian: 'تروندهایم' },
    { id: 'drammen', name: 'Drammen', namePersian: 'درامن' },
    { id: 'fredrikstad', name: 'Fredrikstad', namePersian: 'فردریکستاد' },
    { id: 'kristiansand', name: 'Kristiansand', namePersian: 'کریستیانساند' },
    { id: 'sandnes', name: 'Sandnes', namePersian: 'ساندنس' },
    { id: 'tromsø', name: 'Tromsø', namePersian: 'ترومسو' },
    { id: 'sarpsborg', name: 'Sarpsborg', namePersian: 'سارپسبورگ' }
  ],
  'finland': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'helsinki', name: 'Helsinki', namePersian: 'هلسینکی' },
    { id: 'espoo', name: 'Espoo', namePersian: 'اسپو' },
    { id: 'tampere', name: 'Tampere', namePersian: 'تامپره' },
    { id: 'vantaa', name: 'Vantaa', namePersian: 'وانتا' },
    { id: 'oulu', name: 'Oulu', namePersian: 'اولو' },
    { id: 'turku', name: 'Turku', namePersian: 'تورکو' },
    { id: 'jyvaskyla', name: 'Jyväskylä', namePersian: 'یوواسکیلا' },
    { id: 'lahti', name: 'Lahti', namePersian: 'لاهتی' },
    { id: 'kuopio', name: 'Kuopio', namePersian: 'کوپیو' },
    { id: 'pori', name: 'Pori', namePersian: 'پوری' }
  ],
  'australia': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'sydney', name: 'Sydney', namePersian: 'سیدنی' },
    { id: 'melbourne', name: 'Melbourne', namePersian: 'ملبورن' },
    { id: 'brisbane', name: 'Brisbane', namePersian: 'بریزبن' },
    { id: 'perth', name: 'Perth', namePersian: 'پرث' },
    { id: 'adelaide', name: 'Adelaide', namePersian: 'آدلاید' },
    { id: 'gold-coast', name: 'Gold Coast', namePersian: 'گلد کوست' },
    { id: 'newcastle', name: 'Newcastle', namePersian: 'نیوکاسل' },
    { id: 'canberra', name: 'Canberra', namePersian: 'کانبرا' },
    { id: 'sunshine-coast', name: 'Sunshine Coast', namePersian: 'ساحل آفتابی' },
    { id: 'wollongong', name: 'Wollongong', namePersian: 'وولونگونگ' }
  ],
  'mexico': [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'mexico-city', name: 'Mexico City', namePersian: 'مکزیکو سیتی' },
    { id: 'guadalajara', name: 'Guadalajara', namePersian: 'گوادالاخارا' },
    { id: 'monterrey', name: 'Monterrey', namePersian: 'مونتری' },
    { id: 'puebla', name: 'Puebla', namePersian: 'پوئبلا' },
    { id: 'tijuana', name: 'Tijuana', namePersian: 'تیخوانا' },
    { id: 'leon', name: 'León', namePersian: 'لئون' },
    { id: 'juarez', name: 'Juárez', namePersian: 'خوارز' },
    { id: 'torreon', name: 'Torreón', namePersian: 'تورئون' },
    { id: 'queretaro', name: 'Querétaro', namePersian: 'کرتارو' },
    { id: 'san-luis-potosi', name: 'San Luis Potosí', namePersian: 'سن لوئیس پوتوسی' }
  ]
};

interface AdData {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  urgent: boolean;
  price: string;
  currency: string;
  negotiable: boolean;
  unit: string;
  condition: string;
  country: string;
  city: string;
  images: File[];
  video: File | null;
  termsAccepted: boolean;
  includeBoost: boolean;
}

export function PostAdPage({ onNavigate }: PostAdPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { currentLanguage, t, dir } = useLanguage();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [adData, setAdData] = useState<AdData>({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    urgent: false,
    price: '',
    currency: 'USD',
    negotiable: false,
    unit: 'fixed',
    condition: '',
    country: '',
    city: '',
    images: [],
    video: null,
    termsAccepted: false,
    includeBoost: false
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !adData.category) {
      toast.error('Please select a category');
      return;
    }
    if (currentStep === 2 && !adData.subcategory) {
      toast.error('Please select a subcategory');
      return;
    }
    if (currentStep === 3) {
      if (!adData.title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      if (!adData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }
      if (!adData.price.trim()) {
        toast.error('Please enter a price');
        return;
      }
    }
    if (currentStep === 4) {
      if (!adData.country.trim()) {
        toast.error('Please select a country');
        return;
      }
      if (!adData.city.trim()) {
        toast.error('Please select a city');
        return;
      }
    }
    if (currentStep === 6) {
      if (!adData.termsAccepted) {
        toast.error('Please accept the terms and conditions');
        return;
      }
      handleSubmit();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onNavigate('home');
    }
  };

  const handleSubmit = async () => {
    if (isProcessingPayment) return;
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please log in to post an ad');
      onNavigate('login');
      return;
    }

    // Check if user is admin (with safe access)
    const isAdmin = user && (user.role === 'admin' || user.email === 'ommzadeh@gmail.com');
    
    // Clean localStorage to prevent quota issues
    try {
      const storageUsage = JSON.stringify(localStorage).length;
      if (storageUsage > 8 * 1024 * 1024) { // If over 8MB
        console.log('🧹 Cleaning localStorage to prevent quota issues...');
        const keysToKeep = ['auth_user', 'auth_token', 'demo_language', 'user_preferences'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn('Failed to remove localStorage key:', key);
            }
          }
        });
        console.log('✅ LocalStorage cleaned');
      }
    } catch (cleanupError) {
      console.warn('LocalStorage cleanup failed:', cleanupError);
    }
    
    try {
      setIsProcessingPayment(true);
      toast.loading(isAdmin ? 'Creating your ad (Admin posting)...' : 'Creating your ad...');
      
      // Upload images first
      console.log('📸 Uploading images...', adData.images.length, 'files');
      const uploadedImageUrls: string[] = [];
      
      if (adData.images.length > 0) {
        toast.loading('Uploading images...');
        
        for (let i = 0; i < adData.images.length; i++) {
          const imageFile = adData.images[i];
          try {
            console.log(`📸 Uploading image ${i + 1}/${adData.images.length}:`, imageFile.name);
            const imageUrl = await dataService.uploadFile(imageFile, 'ad-image');
            uploadedImageUrls.push(imageUrl);
            console.log(`✅ Image ${i + 1} uploaded successfully:`, imageUrl.substring(0, 100) + '...');
          } catch (uploadError) {
            console.error(`❌ Image ${i + 1} upload failed:`, uploadError);
            // Don't fail the entire ad creation for one image
            toast.error(`Failed to upload image: ${imageFile.name}`);
          }
        }
        
        toast.dismiss();
        console.log('📸 Total images uploaded:', uploadedImageUrls.length, 'out of', adData.images.length);
      } else {
        console.log('📸 No images to upload');
      }

      // Create the ad - this will automatically save to both Supabase and localStorage
      const newAd = await dataService.createAd({
        title: adData.title.trim(),
        titlePersian: adData.title.trim(),
        description: adData.description.trim(),
        descriptionPersian: adData.description.trim(),
        price: parseFloat(adData.price),
        priceType: adData.negotiable ? 'negotiable' : 'fixed',
        currency: adData.currency,
        category: adData.category,
        subcategory: adData.subcategory,
        condition: adData.condition || undefined,
        location: {
          country: adData.country.toLowerCase().replace(/\s+/g, '-'),
          city: adData.city.toLowerCase().replace(/\s+/g, '-')
        },
        images: uploadedImageUrls,
        userId: user.id,
        username: user.username || user.name || user.email,
        userEmail: user.email,
        featured: adData.includeBoost, // Set featured if boost was selected (for admin posts)
        urgent: adData.urgent,
        contactInfo: {
          email: user.email,
          phone: '',
        }
      });

      toast.dismiss();

      // Admin bypass payment - ad is already created with approved status
      if (isAdmin) {
        console.log('✅ Admin ad posted successfully:', {
          adId: newAd.id,
          title: newAd.title,
          category: newAd.category,
          status: newAd.status,
          paymentStatus: newAd.paymentStatus
        });
        
        toast.dismiss();
        toast.success('✅ Ad posted successfully! (Admin - No payment required)');
        
        // Clear form data
        setAdData({
          title: '',
          description: '',
          price: '',
          currency: 'USD',
          category: '',
          subcategory: '',
          condition: '',
          negotiable: false,
          urgent: false,
          includeBoost: false,
          country: '',
          city: '',
          images: []
        });
        
        setCurrentStep(1);
        setIsProcessingPayment(false);
        
        // Navigate to the new ad or back to home
        setTimeout(() => {
          onNavigate('my-ads');
        }, 1500);
        
        return;
      }

      // Regular user payment process
      toast.loading('Preparing payment...');

      // Create payment
      const payment = await dataService.createPayment({
        userId: user.id,
        adId: newAd.id,
        amount: adData.includeBoost ? 12.00 : 2.00,
        currency: 'USD',
        type: adData.includeBoost ? 'ad_posting_with_boost' : 'ad_posting',
        status: 'pending',
        includeBoost: adData.includeBoost
      });

      // Create Stripe checkout session with boost option
      const session = await stripeService.createCheckoutSession(adData, {
        includeBoost: adData.includeBoost
      });
      
      toast.dismiss();
      toast.loading('Redirecting to secure payment...');
      
      // Save context for post-payment processing
      localStorage.setItem('pendingAdId', newAd.id);
      localStorage.setItem('pendingPaymentId', payment.id);
      localStorage.setItem('paymentSessionId', session.sessionId);
      
      // Redirect to Stripe checkout
      await stripeService.redirectToCheckout(session.url, session.sessionId);
      
    } catch (error) {
      console.error('❌ Ad creation/payment error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        user: user?.email,
        authenticated: isAuthenticated
      });
      toast.dismiss();
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          toast.error('Authentication error. Please sign in again.');
          onNavigate('login');
        } else if (error.message.includes('Payment API error')) {
          toast.error('Payment processing failed. Please try again.');
        } else if (error.message.includes('Database schema issue') || error.message.includes('schema cache') || error.message.includes('relation') || error.message.includes('brand') || error.message.includes('column')) {
          toast.error('Database setup required. Redirecting to fix page...', {
            description: 'Your ad was saved locally but needs database setup to sync.',
            duration: 5000
          });
          // Redirect to ad posting fix page after a delay
          setTimeout(() => {
            window.open('/?page=ad-posting-fix', '_blank');
          }, 2000);
        } else if (error.message.includes('Failed to save ad to any storage')) {
          toast.error('Storage system error. Redirecting to fix page...', {
            description: 'Both database and local storage are having issues.',
            duration: 3000
          });
          // Redirect to ad posting fix page
          setTimeout(() => {
            onNavigate('ad-posting-fix');
          }, 1500);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to create ad. Please try again.');
      }
      setIsProcessingPayment(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAdData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 8) // Max 8 images
    }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAdData(prev => ({ ...prev, video: file }));
  };

  const removeImage = (index: number) => {
    setAdData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setAdData(prev => ({ ...prev, video: null }));
  };

  // Location handlers
  const handleCountrySelect = (countryId: string) => {
    const country = COUNTRIES.find(c => c.id === countryId);
    if (country) {
      const countryName = currentLanguage === 'en' ? country.name : country.namePersian;
      setAdData(prev => ({ ...prev, country: countryName, city: '' }));
      setShowCountryDropdown(false);
      setCountrySearchQuery('');
      setCitySearchQuery('');
      
      // If "all" countries is selected, automatically select "all" cities
      if (countryId === 'all') {
        const allCitiesText = currentLanguage === 'en' ? 'All Cities' : 'همه شهرها';
        setAdData(prev => ({ ...prev, city: allCitiesText }));
      }
    }
  };

  const handleCitySelect = (countryId: string, cityId: string) => {
    const city = CITIES[countryId]?.find(c => c.id === cityId);
    if (city) {
      const cityName = currentLanguage === 'en' ? city.name : city.namePersian;
      setAdData(prev => ({ ...prev, city: cityName }));
      setShowCityDropdown(false);
      setCitySearchQuery('');
    }
  };

  const handleAutoDetect = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, set to London when location is detected
          setIsDetectingLocation(false);
          setAdData(prev => ({ ...prev, country: 'United Kingdom', city: 'London' }));
          toast.success('Location detected successfully');
        },
        (error) => {
          setIsDetectingLocation(false);
          
          let errorMessage = 'Location detection failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = currentLanguage === 'en' 
                ? 'Location access denied by user' 
                : 'دسترسی به مکان توسط کاربر رد شد';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = currentLanguage === 'en' 
                ? 'Location information unavailable' 
                : 'اطلاعات موقعیت در دسترس نیست';
              break;
            case error.TIMEOUT:
              errorMessage = currentLanguage === 'en' 
                ? 'Location request timed out' 
                : 'زمان درخواست موقعیت به پایان رسید';
              break;
            default:
              errorMessage = currentLanguage === 'en' 
                ? 'Unknown geolocation error' 
                : 'خطای نامشخص در تشخیص مکان';
              break;
          }
          
          toast.error(errorMessage);
          
          // Still fallback to London for demo purposes
          setAdData(prev => ({ ...prev, country: 'United Kingdom', city: 'London' }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setIsDetectingLocation(false);
      const errorMessage = currentLanguage === 'en' 
        ? 'Geolocation is not supported by this browser' 
        : 'مرورگر شما از تشخیص مکان پشتیبانی نمی‌کند';
      toast.error(errorMessage);
      
      // Fallback to London
      setAdData(prev => ({ ...prev, country: 'United Kingdom', city: 'London' }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Category</h2>
        <p className="text-gray-600 mb-6">Choose the category that best describes your item or service.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setAdData(prev => ({ ...prev, category: category.id, subcategory: '' }))}
              className={`p-4 border rounded-lg text-center transition-all hover:border-primary ${
                adData.category === category.id ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
            >
              <IconComponent className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm">{category.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Subcategory</h2>
        <p className="text-gray-600 mb-6">Choose a more specific category for better visibility.</p>
      </div>
      
      <div className="space-y-3">
        {subcategories[adData.category as keyof typeof subcategories]?.map((subcategory) => (
          <button
            key={subcategory}
            onClick={() => setAdData(prev => ({ ...prev, subcategory }))}
            className={`w-full p-4 border rounded-lg text-left transition-all hover:border-primary ${
              adData.subcategory === subcategory ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
          >
            <p className="font-medium">{subcategory}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ad Details</h2>
        <p className="text-gray-600 mb-6">Provide detailed information about your item or service.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ad Title *</label>
          <Input
            placeholder="Enter a clear, descriptive title"
            value={adData.title}
            onChange={(e) => setAdData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{adData.title.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ad Description *</label>
          <Textarea
            placeholder="Describe your item in detail..."
            value={adData.description}
            onChange={(e) => setAdData(prev => ({ ...prev, description: e.target.value }))}
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{adData.description.length}/2000 characters</p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="urgent"
            checked={adData.urgent}
            onCheckedChange={(checked) => setAdData(prev => ({ ...prev, urgent: checked as boolean }))}
          />
          <label htmlFor="urgent" className="text-sm font-medium">
            Urgent (Mark as urgent for better visibility)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <Input
              type="number"
              placeholder="0.00"
              value={adData.price}
              onChange={(e) => setAdData(prev => ({ ...prev, price: e.target.value }))}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <Select value={adData.currency} onValueChange={(value) => setAdData(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="TRY">TRY (₺)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="negotiable"
            checked={adData.negotiable}
            onCheckedChange={(checked) => setAdData(prev => ({ ...prev, negotiable: checked as boolean }))}
          />
          <label htmlFor="negotiable" className="text-sm font-medium">
            Price is negotiable
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit</label>
          <Select value={adData.unit} onValueChange={(value) => setAdData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="hour">Per Hour</SelectItem>
              <SelectItem value="night">Per Night</SelectItem>
              <SelectItem value="week">Per Week</SelectItem>
              <SelectItem value="month">Per Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Condition (Optional)</label>
          <Select value={adData.condition} onValueChange={(value) => setAdData(prev => ({ ...prev, condition: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="needs-repair">Needs Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedCountryData = COUNTRIES.find(c => 
      (currentLanguage === 'en' ? c.name : c.namePersian) === adData.country
    );
    const selectedCityData = selectedCountryData ? CITIES[selectedCountryData.id]?.find(c => 
      (currentLanguage === 'en' ? c.name : c.namePersian) === adData.city
    ) : null;
    const availableCities = selectedCountryData ? CITIES[selectedCountryData.id] || [] : [];

    // Filter countries based on search query
    const filteredCountries = COUNTRIES.filter(country => {
      const searchTerm = countrySearchQuery.toLowerCase();
      return country.name.toLowerCase().includes(searchTerm) || 
             country.namePersian.includes(searchTerm);
    });

    // Filter cities based on search query
    const filteredCities = availableCities.filter(city => {
      const searchTerm = citySearchQuery.toLowerCase();
      return city.name.toLowerCase().includes(searchTerm) || 
             city.namePersian.includes(searchTerm);
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select Location</h2>
          <p className="text-gray-600 mb-6">Choose the location where your item or service is available.</p>
        </div>
        
        <div className="space-y-4">
          {/* Country Selector */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Country *</label>
            <button
              onClick={() => {
                const newState = !showCountryDropdown;
                setShowCountryDropdown(newState);
                if (!newState) setCountrySearchQuery('');
              }}
              className="w-full bg-input-background text-foreground px-4 py-4 rounded-lg text-left flex items-center justify-between h-14 border border-border"
            >
              <span className={selectedCountryData ? 'text-foreground' : 'text-muted-foreground'}>
                {adData.country || (currentLanguage === 'en' ? 'Select Country' : 'انتخاب کشور')}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCountryDropdown && (
              <div className="absolute top-20 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60">
                {/* Country Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      placeholder={currentLanguage === 'en' ? 'Search countries...' : 'جستجوی کشورها...'}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
                
                {/* Country List */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => {
                          handleCountrySelect(country.id);
                          setCountrySearchQuery('');
                        }}
                        className="w-full px-4 py-3 text-left text-foreground hover:bg-muted last:rounded-b-lg"
                      >
                        {currentLanguage === 'en' ? country.name : country.namePersian}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-muted-foreground text-center">
                      {currentLanguage === 'en' ? 'No countries found' : 'کشوری یافت نشد'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* City Selector */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">City *</label>
            <button
              onClick={() => {
                if (adData.country) {
                  const newState = !showCityDropdown;
                  setShowCityDropdown(newState);
                  if (!newState) setCitySearchQuery('');
                }
              }}
              className={`w-full bg-input-background text-foreground px-4 py-4 rounded-lg text-left flex items-center justify-between h-14 border border-border ${
                !adData.country ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!adData.country}
            >
              <span className={selectedCityData ? 'text-foreground' : 'text-muted-foreground'}>
                {adData.city || (currentLanguage === 'en' ? 'Select City' : 'انتخاب شهر')}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCityDropdown && adData.country && selectedCountryData && (
              <div className="absolute top-20 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60">
                {/* City Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder={currentLanguage === 'en' ? 'Search cities...' : 'جستجوی شهرها...'}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
                
                {/* City List */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          handleCitySelect(selectedCountryData.id, city.id);
                          setCitySearchQuery('');
                        }}
                        className="w-full px-4 py-3 text-left text-foreground hover:bg-muted last:rounded-b-lg"
                      >
                        {currentLanguage === 'en' ? city.name : city.namePersian}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-muted-foreground text-center">
                      {currentLanguage === 'en' ? 'No cities found' : 'شهری یافت نشد'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auto-detect button */}
          <button
            onClick={handleAutoDetect}
            disabled={isDetectingLocation}
            className="w-full bg-muted text-primary px-4 py-3 rounded-lg text-center border border-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{currentLanguage === 'en' ? 'Detecting...' : 'در حال تشخیص...'}</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span>{currentLanguage === 'en' ? 'Auto-detect my location' : 'تشخیص خودکار مکان من'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add Photos & Video</h2>
        <p className="text-gray-600 mb-6">Add up to 8 photos and 1 video to showcase your item (optional).</p>
      </div>
      
      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 8)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">Click to upload photos</p>
              <p className="text-sm text-gray-500">Or drag and drop files here</p>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB each (max 8 photos)</p>
            </label>
          </div>

          {/* Image Previews */}
          {adData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {adData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Video (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">Click to upload video</p>
              <p className="text-sm text-gray-500">Or drag and drop video here</p>
              <p className="text-xs text-gray-400 mt-2">MP4, MOV up to 50MB</p>
            </label>
          </div>

          {/* Video Preview */}
          {adData.video && (
            <div className="mt-4">
              <div className="relative inline-block">
                <video
                  src={URL.createObjectURL(adData.video)}
                  className="w-48 h-32 object-cover rounded-lg"
                  controls
                />
                <button
                  onClick={removeVideo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Payment</h2>
        <p className="text-gray-600 mb-6">Review your ad and accept terms before payment.</p>
      </div>
      
      {/* Ad Preview */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="flex gap-4">
          {adData.images.length > 0 ? (
            <img
              src={URL.createObjectURL(adData.images[0])}
              alt="Ad preview"
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs">No Image</span>
            </div>
          )}
          
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{adData.title}</h4>
            <p className="text-2xl font-bold text-primary">
              {adData.price} {adData.currency}
              {adData.unit !== 'fixed' && <span className="text-sm font-normal text-gray-600 ml-2">/ {adData.unit}</span>}
              {adData.negotiable && <span className="text-sm font-normal text-gray-600 ml-2">(Negotiable)</span>}
            </p>
            <p className="text-sm text-gray-500">
              {categories.find(c => c.id === adData.category)?.name}
              {adData.subcategory && <span> • {adData.subcategory}</span>}
            </p>
            {adData.condition && <p className="text-sm text-gray-500">Condition: {adData.condition}</p>}
            {adData.urgent && <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">Urgent</span>}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">Description:</h5>
          <p className="text-gray-700 text-sm">{adData.description}</p>
        </div>
        
        {adData.images.length > 1 && (
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2">Photos ({adData.images.length}):</h5>
            <div className="flex space-x-2">
              {adData.images.slice(1, 6).map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 2}`}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
              {adData.images.length > 6 && (
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs">+{adData.images.length - 6}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {adData.video && (
          <div className="border-t pt-4">
            <h5 className="font-medium mb-2">Video:</h5>
            <video
              src={URL.createObjectURL(adData.video)}
              className="w-32 h-24 object-cover rounded"
              controls
            />
          </div>
        )}
      </div>
      
      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-4">
          {/* Base Ad Posting Fee */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-blue-900">Ad Posting Fee</h5>
              <p className="text-sm text-blue-700">30 days visibility</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-900">$2.00</p>
              <p className="text-sm text-blue-600">USD</p>
            </div>
          </div>

          {/* Boost Option */}
          <div className="border-t border-blue-200 pt-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="boost-option"
                checked={adData.includeBoost}
                onCheckedChange={(checked) => setAdData(prev => ({ ...prev, includeBoost: checked as boolean }))}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="boost-option" className="font-medium text-blue-900 cursor-pointer">
                      🚀 Boost to Featured
                    </label>
                    <p className="text-sm text-blue-700">Get 7 days of featured placement for maximum visibility</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-orange-600">+$10.00</p>
                    <p className="text-sm text-orange-500">USD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-blue-300 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-blue-900">Total Amount</h5>
                <p className="text-sm text-blue-700">
                  {adData.includeBoost ? 'Ad posting + Featured boost' : 'Ad posting only'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  ${adData.includeBoost ? '12.00' : '2.00'}
                </p>
                <p className="text-sm text-blue-600">USD</p>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <CreditCard className="h-4 w-4 mr-2" />
              Secure payment powered by Stripe
            </div>
          </div>
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms-agreement"
            checked={adData.termsAccepted}
            onCheckedChange={(checked) => setAdData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
            className="mt-1"
          />
          <div className="flex-1">
            <label htmlFor="terms-agreement" className="text-sm font-medium cursor-pointer">
              I agree to the Terms and Conditions
            </label>
            <p className="text-xs text-gray-500 mt-1">
              By posting this ad, you agree to our terms of service and community guidelines. 
              Please ensure your ad content is accurate and follows our posting rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Category';
      case 2: return 'Subcategory';
      case 3: return 'Details';
      case 4: return 'Location';
      case 5: return 'Media';
      case 6: return 'Review & Payment';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Back to Home' : 'Back'}
            </Button>
            
            <h1 className="text-xl font-semibold">Post New Ad</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Auto-Sync Notification */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-primary" />
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <span className="font-medium text-primary">Auto-Sync Enabled:</span>
              <span className="text-gray-700 ml-2">
                Your ad will be automatically saved to both cloud database and local storage for maximum reliability.
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {getStepTitle()}</CardTitle>
          </CardHeader>
          
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isProcessingPayment}
              className="bg-action hover:bg-action/90 text-white"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === totalSteps ? 'Proceed to Payment' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}