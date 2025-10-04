import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, ChevronDown } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner@2.0.3';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (country: string, city: string) => void;
}

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
    { id: 'ballymena', name: 'Ballymena', namePersian: 'با��یمنا' },
    { id: 'bangor', name: 'Bangor', namePersian: 'بانگور' },
    { id: 'banbury', name: 'Banbury', namePersian: 'بانبری' },
    { id: 'barnsley', name: 'Barnsley', namePersian: 'بارنزلی' },
    { id: 'barrow-in-furness', name: 'Barrow-in-Furness', namePersian: 'بارو این فرنس' },
    { id: 'barry', name: 'Barry', namePersian: 'بری' },
    { id: 'basildon', name: 'Basildon', namePersian: 'ب��������زیلدون' },
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
    { id: 'kings-lynn', name: 'King\'s Lynn', namePersian: 'کینگز لین' },
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
    { id: 'westminster', name: 'Westminster', namePersian: 'وستم��نستر' },
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
  usa: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'albuquerque', name: 'Albuquerque', namePersian: 'آلبوکرکی' },
    { id: 'anchorage', name: 'Anchorage', namePersian: 'انکریج' },
    { id: 'arlington', name: 'Arlington', namePersian: 'آرلینگتون' },
    { id: 'atlanta', name: 'Atlanta', namePersian: 'آتلانتا' },
    { id: 'austin', name: 'Austin', namePersian: 'آستین' },
    { id: 'baltimore', name: 'Baltimore', namePersian: 'بالتیمور' },
    { id: 'billings', name: 'Billings', namePersian: 'بیلینگز' },
    { id: 'birmingham', name: 'Birmingham', namePersian: 'بیرمنگهام' },
    { id: 'boston', name: 'Boston', namePersian: 'بوستو��' },
    { id: 'bridgeport', name: 'Bridgeport', namePersian: 'بریجپورت' },
    { id: 'buffalo', name: 'Buffalo', namePersian: 'بوفالو' },
    { id: 'burlington', name: 'Burlington', namePersian: 'برلینگتون' },
    { id: 'charleston', name: 'Charleston', namePersian: 'چارلستون' },
    { id: 'charlotte', name: 'Charlotte', namePersian: 'شارلوت' },
    { id: 'cheyenne', name: 'Cheyenne', namePersian: 'شاین' },
    { id: 'chicago', name: 'Chicago', namePersian: 'شیکاگو' },
    { id: 'chula-vista', name: 'Chula Vista', namePersian: 'چولا ویستا' },
    { id: 'cincinnati', name: 'Cincinnati', namePersian: 'سینسیناتی' },
    { id: 'cleveland', name: 'Cleveland', namePersian: 'کلیولند' },
    { id: 'colorado-springs', name: 'Colorado Springs', namePersian: 'کلرادو اسپرینگز' },
    { id: 'columbus', name: 'Columbus', namePersian: 'کلمبوس' },
    { id: 'dallas', name: 'Dallas', namePersian: 'دالاس' },
    { id: 'denver', name: 'Denver', namePersian: 'دنور' },
    { id: 'des-moines', name: 'Des Moines', namePersian: 'دیس موینز' },
    { id: 'detroit', name: 'Detroit', namePersian: 'دیترویت' },
    { id: 'el-paso', name: 'El Paso', namePersian: 'ال پاسو' },
    { id: 'fargo', name: 'Fargo', namePersian: 'فارگو' },
    { id: 'fort-worth', name: 'Fort Worth', namePersian: 'فورت ورث' },
    { id: 'fresno', name: 'Fresno', namePersian: 'فرزنو' },
    { id: 'greensboro', name: 'Greensboro', namePersian: 'گرینزبرو' },
    { id: 'henderson', name: 'Henderson', namePersian: 'هندرسون' },
    { id: 'honolulu', name: 'Honolulu', namePersian: '��ونولولو' },
    { id: 'houston', name: 'Houston', namePersian: 'هیوستون' },
    { id: 'indianapolis', name: 'Indianapolis', namePersian: 'ایندیاناپولیس' },
    { id: 'jacksonville', name: 'Jacksonville', namePersian: 'جکسونویل' },
    { id: 'jersey-city', name: 'Jersey City', namePersian: 'جرسی سیتی' },
    { id: 'kansas-city', name: 'Kansas City', namePersian: 'کانزاس سیتی' },
    { id: 'las-vegas', name: 'Las Vegas', namePersian: 'لاس وگاس' },
    { id: 'lexington', name: 'Lexington', namePersian: 'لکسینگتون' },
    { id: 'lincoln', name: 'Lincoln', namePersian: 'لینکلن' },
    { id: 'little-rock', name: 'Little Rock', namePersian: 'لیتل راک' },
    { id: 'long-beach', name: 'Long Beach', namePersian: 'لانگ بیچ' },
    { id: 'los-angeles', name: 'Los Angeles', namePersian: 'لس آنجلس' },
    { id: 'louisville', name: 'Louisville', namePersian: 'لوئیزویل' },
    { id: 'manchester', name: 'Manchester', namePersian: 'منچستر' },
    { id: 'memphis', name: 'Memphis', namePersian: 'ممفیس' },
    { id: 'mesa', name: 'Mesa', namePersian: 'میسا' },
    { id: 'miami', name: 'Miami', namePersian: 'میامی' },
    { id: 'milwaukee', name: 'Milwaukee', namePersian: 'میلواکی' },
    { id: 'minneapolis', name: 'Minneapolis', namePersian: 'مینیاپولیس' },
    { id: 'nashville', name: 'Nashville', namePersian: 'نشویل' },
    { id: 'new-orleans', name: 'New Orleans', namePersian: 'نیو اورلینز' },
    { id: 'new-york', name: 'New York', namePersian: 'نیویورک' },
    { id: 'newark', name: 'Newark', namePersian: 'نیوآرک' },
    { id: 'norfolk', name: 'Norfolk', namePersian: 'نورفولک' },
    { id: 'oakland', name: 'Oakland', namePersian: 'اوکلند' },
    { id: 'oklahoma-city', name: 'Oklahoma City', namePersian: 'اوکلاهما سیتی' },
    { id: 'omaha', name: 'Omaha', namePersian: 'اوماها' },
    { id: 'orlando', name: 'Orlando', namePersian: 'اورلاندو' },
    { id: 'philadelphia', name: 'Philadelphia', namePersian: 'فیلادلفیا' },
    { id: 'phoenix', name: 'Phoenix', namePersian: 'فینیکس' },
    { id: 'pittsburgh', name: 'Pittsburgh', namePersian: 'پیتسبرگ' },
    { id: 'plano', name: 'Plano', namePersian: 'پلانو' },
    { id: 'portland', name: 'Portland', namePersian: 'پورتلند' },
    { id: 'providence', name: 'Providence', namePersian: 'پروویدنس' },
    { id: 'raleigh', name: 'Raleigh', namePersian: 'رالی' },
    { id: 'richmond', name: 'Richmond', namePersian: 'ریچموند' },
    { id: 'sacramento', name: 'Sacramento', namePersian: 'ساکرامنتو' },
    { id: 'saint-paul', name: 'Saint Paul', namePersian: 'سنت پاول' },
    { id: 'salt-lake-city', name: 'Salt Lake City', namePersian: 'سالت لیک سیتی' },
    { id: 'san-antonio', name: 'San Antonio', namePersian: 'سن آنتونیو' },
    { id: 'san-diego', name: 'San Diego', namePersian: 'سن دیگو' },
    { id: 'san-francisco', name: 'San Francisco', namePersian: 'سن فرانسیسکو' },
    { id: 'san-jose', name: 'San Jose', namePersian: 'سن خوزه' },
    { id: 'santa-fe', name: 'Santa Fe', namePersian: 'سانتا فه' },
    { id: 'seattle', name: 'Seattle', namePersian: 'سیاتل' },
    { id: 'sioux-falls', name: 'Sioux Falls', namePersian: 'سیو فالز' },
    { id: 'st-louis', name: 'St. Louis', namePersian: 'سنت لوئیس' },
    { id: 'stockton', name: 'Stockton', namePersian: 'استاکتون' },
    { id: 'tampa', name: 'Tampa', namePersian: 'تامپا' },
    { id: 'toledo', name: 'Toledo', namePersian: 'تولدو' },
    { id: 'tucson', name: 'Tucson', namePersian: 'توسان' },
    { id: 'tulsa', name: 'Tulsa', namePersian: 'تولسا' },
    { id: 'virginia-beach', name: 'Virginia Beach', namePersian: 'ویرجینیا بیچ' },
    { id: 'washington-dc', name: 'Washington DC', namePersian: 'واشنگتن دی سی' },
    { id: 'wichita', name: 'Wichita', namePersian: 'ویچیتا' },
    { id: 'wilmington', name: 'Wilmington', namePersian: 'ویلمینگتون' }
  ],
  sweden: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'angelholm', name: 'Ängelholm', namePersian: 'اینگلهولم' },
    { id: 'avesta', name: 'Avesta', namePersian: 'آوستا' },
    { id: 'bollnas', name: 'Bollnäs', namePersian: 'بولناس' },
    { id: 'borlange', name: 'Borlänge', namePersian: 'بورلنگه' },
    { id: 'boras', name: 'Borås', namePersian: 'بوروس' },
    { id: 'danderyd', name: 'Danderyd', namePersian: 'داندرید' },
    { id: 'eskilstuna', name: 'Eskilstuna', namePersian: 'اسکیلستونا' },
    { id: 'falkenberg', name: 'Falkenberg', namePersian: 'فالکنبرگ' },
    { id: 'falun', name: 'Falun', namePersian: 'فالون' },
    { id: 'gavle', name: 'Gävle', namePersian: 'یوله' },
    { id: 'gothenburg', name: 'Gothenburg', namePersian: 'گوتنبرگ' },
    { id: 'halmstad', name: 'Halmstad', namePersian: 'هالمستاد' },
    { id: 'helsingborg', name: 'Helsingborg', namePersian: 'هلسینگبرگ' },
    { id: 'hudiksvall', name: 'Hudiksvall', namePersian: 'هودیکسوال' },
    { id: 'jonkoping', name: 'Jönköping', namePersian: 'یونشوپینگ' },
    { id: 'kalmar', name: 'Kalmar', namePersian: 'کالمار' },
    { id: 'karlskrona', name: 'Karlskrona', namePersian: 'کارلسکرونا' },
    { id: 'karlstad', name: 'Karlstad', namePersian: 'کارلستاد' },
    { id: 'katrineholm', name: 'Katrineholm', namePersian: 'کاترینهولم' },
    { id: 'kiruna', name: 'Kiruna', namePersian: 'کیرونا' },
    { id: 'koping', name: 'Köping', namePersian: 'شوپینگ' },
    { id: 'kristianstad', name: 'Kristianstad', namePersian: 'کریستیانستاد' },
    { id: 'kungsbacka', name: 'Kungsbacka', namePersian: 'کونگسباکا' },
    { id: 'landskrona', name: 'Landskrona', namePersian: 'لندسکرونا' },
    { id: 'lidingo', name: 'Lidingö', namePersian: 'لیدینگو' },
    { id: 'lidkoping', name: 'Lidköping', namePersian: 'لیدشوپینگ' },
    { id: 'linkoping', name: 'Linköping', namePersian: 'لینشوپینگ' },
    { id: 'ludvika', name: 'Ludvika', namePersian: 'لودویکا' },
    { id: 'lulea', name: 'Luleå', namePersian: 'لولئو' },
    { id: 'lund', name: 'Lund', namePersian: 'لوند' },
    { id: 'malmo', name: 'Malmö', namePersian: 'مالمو' },
    { id: 'mariestad', name: 'Mariestad', namePersian: 'ماریستاد' },
    { id: 'mjolby', name: 'Mjölby', namePersian: 'میولبی' },
    { id: 'motala', name: 'Motala', namePersian: 'موتالا' },
    { id: 'nacka', name: 'Nacka', namePersian: 'ناکا' },
    { id: 'norrkoping', name: 'Norrköping', namePersian: 'نورشوپینگ' },
    { id: 'norrtalje', name: 'Norrtälje', namePersian: 'نورتالیه' },
    { id: 'nykoping', name: 'Nyköping', namePersian: 'نیشوپینگ' },
    { id: 'orebro', name: 'Örebro', namePersian: 'اوربرو' },
    { id: 'ornskoldsvik', name: 'Örnsköldsvik', namePersian: 'اورنشولدسویک' },
    { id: 'ostersund', name: 'Östersund', namePersian: 'اوسترسوند' },
    { id: 'pitea', name: 'Piteå', namePersian: 'پیتئو' },
    { id: 'sandviken', name: 'Sandviken', namePersian: 'ساندویکن' },
    { id: 'sigtuna', name: 'Sigtuna', namePersian: 'سیگتونا' },
    { id: 'skelleftea', name: 'Skellefteå', namePersian: 'اسکلفتئو' },
    { id: 'skovde', name: 'Skövde', namePersian: 'شووده' },
    { id: 'soderhamn', name: 'Söderhamn', namePersian: 'سودرهامن' },
    { id: 'sodertalje', name: 'Södertälje', namePersian: 'سودرتالیه' },
    { id: 'stockholm', name: 'Stockholm', namePersian: 'استکهلم' },
    { id: 'sundsvall', name: 'Sundsvall', namePersian: 'سوندسوال' },
    { id: 'taby', name: 'Täby', namePersian: 'تبی' },
    { id: 'trelleborg', name: 'Trelleborg', namePersian: 'ترلبرگ' },
    { id: 'trollhattan', name: 'Trollhättan', namePersian: 'ترولهتان' },
    { id: 'uddevalla', name: 'Uddevalla', namePersian: 'اودوالا' },
    { id: 'umea', name: 'Umeå', namePersian: 'اومئو' },
    { id: 'uppsala', name: 'Uppsala', namePersian: 'اوپسالا' },
    { id: 'varberg', name: 'Varberg', namePersian: 'واربرگ' },
    { id: 'vasteras', name: 'Västerås', namePersian: 'وستروس' },
    { id: 'vaxjo', name: 'Växjö', namePersian: 'وکشو' },
    { id: 'vaxholm', name: 'Vaxholm', namePersian: 'واکسهولم' }
  ],
  spain: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'a-coruna', name: 'A Coruña', namePersian: 'آ کورونیا' },
    { id: 'alcala-de-henares', name: 'Alcalá de Henares', namePersian: '��لکالا ده هنارس' },
    { id: 'albacete', name: 'Albacete', namePersian: 'آلباسته' },
    { id: 'alcobendas', name: 'Alcobendas', namePersian: 'آلکوبنداس' },
    { id: 'alcorcon', name: 'Alcorcón', namePersian: 'آلکورکون' },
    { id: 'alicante', name: 'Alicante', namePersian: 'آلیکانته' },
    { id: 'almeria', name: 'Almería', namePersian: 'آلمریا' },
    { id: 'aviles', name: 'Avilés', namePersian: 'آویلس' },
    { id: 'badajoz', name: 'Badajoz', namePersian: 'باداخوس' },
    { id: 'badalona', name: 'Badalona', namePersian: 'بادالونا' },
    { id: 'barakaldo', name: 'Barakaldo', namePersian: 'ب��راکالدو' },
    { id: 'barcelona', name: 'Barcelona', namePersian: 'بارسلونا' },
    { id: 'beziers', name: 'Béziers', namePersian: 'بزیه' },
    { id: 'bilbao', name: 'Bilbao', namePersian: 'بیلبائو' },
    { id: 'burgos', name: 'Burgos', namePersian: 'بورگوس' },
    { id: 'caceres', name: 'Cáceres', namePersian: 'کاسرس' },
    { id: 'cadiz', name: 'Cádiz', namePersian: 'کادیس' },
    { id: 'cartagena', name: 'Cartagena', namePersian: 'کارتاخنا' },
    { id: 'castellon-de-la-plana', name: 'Castellón de la Plana', namePersian: 'کاستیون ده لا پلانا' },
    { id: 'cordoba', name: 'Córdoba', namePersian: 'قرطبه' },
    { id: 'cornella-de-llobregat', name: 'Cornellà de Llobregat', namePersian: 'کورنیا ده یوبرگات' },
    { id: 'coslada', name: 'Coslada', namePersian: 'کوسلادا' },
    { id: 'dos-hermanas', name: 'Dos Hermanas', namePersian: 'دوس هرماناس' },
    { id: 'donostia-san-sebastian', name: 'Donostia-San Sebastián', namePersian: 'دونوستیا-سن سباستیان' },
    { id: 'el-ejido', name: 'El Ejido', namePersian: 'ال اخیدو' },
    { id: 'el-puerto-de-santa-maria', name: 'El Puerto de Santa María', namePersian: 'ال پورتو ده سانتا ماریا' },
    { id: 'elche', name: 'Elche', namePersian: 'الچه' },
    { id: 'fuenlabrada', name: 'Fuenlabrada', namePersian: 'فوئن‌لابرادا' },
    { id: 'gecho', name: 'Gecho', namePersian: 'گچو' },
    { id: 'getafe', name: 'Getafe', namePersian: 'گتافه' },
    { id: 'gijon', name: 'Gijón', namePersian: 'خیخون' },
    { id: 'girona', name: 'Girona', namePersian: 'ژیرونا' },
    { id: 'granada', name: 'Granada', namePersian: 'گرانادا' },
    { id: 'guadalajara', name: 'Guadalajara', namePersian: 'گوادالاخارا' },
    { id: 'huelva', name: 'Huelva', namePersian: 'هوئلوا' },
    { id: 'lhospitalet-de-llobregat', name: "L'Hospitalet de Llobregat", namePersian: 'لوسپیتالت ده یوبرگات' },
    { id: 'jerez-de-la-frontera', name: 'Jerez de la Frontera', namePersian: 'خرس ده لا فرونترا' },
    { id: 'las-palmas', name: 'Las Palmas', namePersian: 'لاس پالماس' },
    { id: 'leganes', name: 'Leganés', namePersian: 'لگانس' },
    { id: 'leon', name: 'León', namePersian: 'لئون' },
    { id: 'lleida', name: 'Lleida', namePersian: 'یئیدا' },
    { id: 'logrono', name: 'Logroño', namePersian: 'لوگرونیو' },
    { id: 'lorca', name: 'Lorca', namePersian: 'لورکا' },
    { id: 'lugo', name: 'Lugo', namePersian: 'لوگو' },
    { id: 'madrid', name: 'Madrid', namePersian: 'مادرید' },
    { id: 'marbella', name: 'Marbella', namePersian: 'ماربیا' },
    { id: 'mataro', name: 'Mataró', namePersian: 'ماتارو' },
    { id: 'mostoles', name: 'Móstoles', namePersian: 'موستولس' },
    { id: 'murcia', name: 'Murcia', namePersian: 'مورسیا' },
    { id: 'orihuela', name: 'Orihuela', namePersian: 'اوریهوئلا' },
    { id: 'oviedo', name: 'Oviedo', namePersian: 'اوویدو' },
    { id: 'palencia', name: 'Palencia', namePersian: 'پالنسیا' },
    { id: 'palma', name: 'Palma', namePersian: 'پالما' },
    { id: 'pamplona', name: 'Pamplona', namePersian: 'پامپلونا' },
    { id: 'parla', name: 'Parla', namePersian: 'پارلا' },
    { id: 'pontevedra', name: 'Pontevedra', namePersian: 'پون�������ودرا' },
    { id: 'pozuelo-de-alarcon', name: 'Pozuelo de Alarcón', namePersian: 'پوسوئلو ده آلارکون' },
    { id: 'reus', name: 'Reus', namePersian: 'رئوس' },
    { id: 'sabadell', name: 'Sabadell', namePersian: 'سابادل' },
    { id: 'salamanca', name: 'Salamanca', namePersian: 'سالامانکا' },
    { id: 'san-fernando', name: 'San Fernando', namePersian: 'سن فرناندو' },
    { id: 'santa-cruz-de-tenerife', name: 'Santa Cruz de Tenerife', namePersian: 'سانتا کروس ده تنریفه' },
    { id: 'santander', name: 'Santander', namePersian: 'سانتاندر' },
    { id: 'santiago-de-compostela', name: 'Santiago de Compostela', namePersian: 'سانتیاگو ده کومپوستلا' },
    { id: 'talavera-de-la-reina', name: 'Talavera de la Reina', namePersian: 'تالاورا ده لا رینا' },
    { id: 'tarragona', name: 'Tarragona', namePersian: 'تاراگونا' },
    { id: 'telde', name: 'Telde', namePersian: 'تلده' },
    { id: 'terrassa', name: 'Terrassa', namePersian: 'تراسا' },
    { id: 'toledo', name: 'Toledo', namePersian: 'تولدو' },
    { id: 'torrejon-de-ardoz', name: 'Torrejón de Ardoz', namePersian: 'توره‌خون ده آردوس' },
    { id: 'valencia', name: 'Valencia', namePersian: 'والنسیا' },
    { id: 'valladolid', name: 'Valladolid', namePersian: 'والیادولید' },
    { id: 'vigo', name: 'Vigo', namePersian: 'ویگو' },
    { id: 'vitoria-gasteiz', name: 'Vitoria-Gasteiz', namePersian: 'ویتوریا-گاستیس' },
    { id: 'zaragoza', name: 'Zaragoza', namePersian: 'ساراگوسا' }
  ],
  italy: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'andria', name: 'Andria', namePersian: 'آندریا' },
    { id: 'ancona', name: 'Ancona', namePersian: 'آنکونا' },
    { id: 'aprilia', name: 'Aprilia', namePersian: 'آپریلیا' },
    { id: 'arezzo', name: 'Arezzo', namePersian: 'آرتسو' },
    { id: 'asti', name: 'Asti', namePersian: 'آستی' },
    { id: 'bari', name: 'Bari', namePersian: 'باری' },
    { id: 'barletta', name: 'Barletta', namePersian: 'بارلتا' },
    { id: 'bergamo', name: 'Bergamo', namePersian: 'برگامو' },
    { id: 'bologna', name: 'Bologna', namePersian: 'بولونیا' },
    { id: 'bolzano', name: 'Bolzano', namePersian: 'بولزانو' },
    { id: 'brescia', name: 'Brescia', namePersian: 'برشا' },
    { id: 'brindisi', name: 'Brindisi', namePersian: 'بریندیزی' },
    { id: 'busto-arsizio', name: 'Busto Arsizio', namePersian: 'بوستو آرسیتسیو' },
    { id: 'cagliari', name: 'Cagliari', namePersian: 'کالیاری' },
    { id: 'caltanissetta', name: 'Caltanissetta', namePersian: 'کالتانیستا' },
    { id: 'carrara', name: 'Carrara', namePersian: 'کارارا' },
    { id: 'caserta', name: 'Caserta', namePersian: 'کازرتا' },
    { id: 'castellammare-di-stabia', name: 'Castellammare di Stabia', namePersian: 'کاستلامره دی استابیا' },
    { id: 'catania', name: 'Catania', namePersian: 'کاتانیا' },
    { id: 'catanzaro', name: 'Catanzaro', namePersian: 'کاتانزارو' },
    { id: 'cesena', name: 'Cesena', namePersian: 'چزنا' },
    { id: 'cinisello-balsamo', name: 'Cinisello Balsamo', namePersian: 'چینیزلو بالسامو' },
    { id: 'como', name: 'Como', namePersian: 'کومو' },
    { id: 'cosenza', name: 'Cosenza', namePersian: 'کوزنتسا' },
    { id: 'cremona', name: 'Cremona', namePersian: 'کرمونا' },
    { id: 'ferrara', name: 'Ferrara', namePersian: 'فرارا' },
    { id: 'florence', name: 'Florence', namePersian: 'فلورانس' },
    { id: 'foggia', name: 'Foggia', namePersian: 'فوجا' },
    { id: 'forli', name: 'Forlì', namePersian: 'فورلی' },
    { id: 'gallarate', name: 'Gallarate', namePersian: 'گالاراته' },
    { id: 'genoa', name: 'Genoa', namePersian: 'جنوا' },
    { id: 'giugliano-in-campania', name: 'Giugliano in Campania', namePersian: 'جولیانو این کامپانیا' },
    { id: 'guidonia-montecelio', name: 'Guidonia Montecelio', namePersian: 'گیدونیا مونته‌چلیو' },
    { id: 'la-spezia', name: 'La Spezia', namePersian: 'لا اسپتسیا' },
    { id: 'latina', name: 'Latina', namePersian: 'لاتینا' },
    { id: 'lecce', name: 'Lecce', namePersian: 'لچه' },
    { id: 'livorno', name: 'Livorno', namePersian: 'لیورنو' },
    { id: 'matera', name: 'Matera', namePersian: 'ماترا' },
    { id: 'massa', name: 'Massa', namePersian: 'ماسا' },
    { id: 'messina', name: 'Messina', namePersian: 'مسینا' },
    { id: 'milan', name: 'Milan', namePersian: 'میلان' },
    { id: 'modena', name: 'Modena', namePersian: 'مودنا' },
    { id: 'monza', name: 'Monza', namePersian: 'مونزا' },
    { id: 'naples', name: 'Naples', namePersian: 'ناپل' },
    { id: 'novara', name: 'Novara', namePersian: 'نوارا' },
    { id: 'padua', name: 'Padua', namePersian: 'پادوا' },
    { id: 'palermo', name: 'Palermo', namePersian: 'پالرمو' },
    { id: 'parma', name: 'Parma', namePersian: 'پارما' },
    { id: 'perugia', name: 'Perugia', namePersian: 'پروجا' },
    { id: 'pesaro', name: 'Pesaro', namePersian: 'پزارو' },
    { id: 'pescara', name: 'Pescara', namePersian: 'پسکارا' },
    { id: 'piacenza', name: 'Piacenza', namePersian: 'پیاچنتسا' },
    { id: 'pisa', name: 'Pisa', namePersian: 'پیزا' },
    { id: 'pistoia', name: 'Pistoia', namePersian: 'پیستویا' },
    { id: 'potenza', name: 'Potenza', namePersian: 'پوتنتسا' },
    { id: 'pozzuoli', name: 'Pozzuoli', namePersian: 'پوتسوولی' },
    { id: 'prato', name: 'Prato', namePersian: 'پراتو' },
    { id: 'ragusa', name: 'Ragusa', namePersian: 'راگوزا' },
    { id: 'ravenna', name: 'Ravenna', namePersian: 'راونا' },
    { id: 'reggio-calabria', name: 'Reggio Calabria', namePersian: 'رجو کالابریا' },
    { id: 'reggio-emilia', name: 'Reggio Emilia', namePersian: 'رجو امیلیا' },
    { id: 'rimini', name: 'Rimini', namePersian: 'ریمینی' },
    { id: 'rome', name: 'Rome', namePersian: 'رم' },
    { id: 'salerno', name: 'Salerno', namePersian: 'سالرنو' },
    { id: 'sassari', name: 'Sassari', namePersian: 'ساساری' },
    { id: 'sesto-san-giovanni', name: 'Sesto San Giovanni', namePersian: 'سستو سن جووانی' },
    { id: 'syracuse', name: 'Syracuse', namePersian: 'سیراکوزا' },
    { id: 'taranto', name: 'Taranto', namePersian: 'تارانتو' },
    { id: 'terni', name: 'Terni', namePersian: 'ترنی' },
    { id: 'trento', name: 'Trento', namePersian: 'ترنتو' },
    { id: 'treviso', name: 'Treviso', namePersian: 'تروزو' },
    { id: 'trieste', name: 'Trieste', namePersian: 'تریسته' },
    { id: 'turin', name: 'Turin', namePersian: 'تورین' },
    { id: 'udine', name: 'Udine', namePersian: 'اودینه' },
    { id: 'varese', name: 'Varese', namePersian: 'وارزه' },
    { id: 'venice', name: 'Venice', namePersian: 'ونیز' },
    { id: 'verona', name: 'Verona', namePersian: 'ورونا' },
    { id: 'vicenza', name: 'Vicenza', namePersian: 'ویچنتسا' }
  ],
  germany: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'aachen', name: 'Aachen', namePersian: 'آخن' },
    { id: 'augsburg', name: 'Augsburg', namePersian: 'آوگسبورگ' },
    { id: 'bergisch-gladbach', name: 'Bergisch Gladbach', namePersian: 'برگیش گلادباخ' },
    { id: 'berlin', name: 'Berlin', namePersian: 'برلین' },
    { id: 'bielefeld', name: 'Bielefeld', namePersian: 'بیله‌فلد' },
    { id: 'bochum', name: 'Bochum', namePersian: 'بوخوم' },
    { id: 'bonn', name: 'Bonn', namePersian: 'بن' },
    { id: 'bottrop', name: 'Bottrop', namePersian: 'بوتروپ' },
    { id: 'braunschweig', name: 'Braunschweig', namePersian: 'براونشوایگ' },
    { id: 'bremen', name: 'Bremen', namePersian: 'برمن' },
    { id: 'bremerhaven', name: 'Bremerhaven', namePersian: 'برمرهافن' },
    { id: 'chemnitz', name: 'Chemnitz', namePersian: 'کمنیتس' },
    { id: 'cologne', name: 'Cologne', namePersian: 'کلن' },
    { id: 'darmstadt', name: 'Darmstadt', namePersian: 'دارمشتات' },
    { id: 'dortmund', name: 'Dortmund', namePersian: 'دورتموند' },
    { id: 'dresden', name: 'Dresden', namePersian: 'درسدن' },
    { id: 'duisburg', name: 'Duisburg', namePersian: 'دویسبورگ' },
    { id: 'dusseldorf', name: 'Düsseldorf', namePersian: 'دوسلدورف' },
    { id: 'erfurt', name: 'Erfurt', namePersian: 'ارفورت' },
    { id: 'erlangen', name: 'Erlangen', namePersian: 'ارلانگن' },
    { id: 'essen', name: 'Essen', namePersian: 'اسن' },
    { id: 'freiburg', name: 'Freiburg', namePersian: 'فرایبورگ' },
    { id: 'furth', name: 'Fürth', namePersian: 'فورت' },
    { id: 'gelsenkirchen', name: 'Gelsenkirchen', namePersian: 'گلزن‌کیرشن' },
    { id: 'gottingen', name: 'Göttingen', namePersian: 'گوتینگن' },
    { id: 'hagen', name: 'Hagen', namePersian: 'هاگن' },
    { id: 'halle', name: 'Halle', namePersian: 'هاله' },
    { id: 'hamburg', name: 'Hamburg', namePersian: 'هامبورگ' },
    { id: 'hamm', name: 'Hamm', namePersian: 'هام' },
    { id: 'hanover', name: 'Hanover', namePersian: 'هانوور' },
    { id: 'heidelberg', name: 'Heidelberg', namePersian: 'هایدلبرگ' },
    { id: 'heilbronn', name: 'Heilbronn', namePersian: 'هایل‌برون' },
    { id: 'herne', name: 'Herne', namePersian: 'هرنه' },
    { id: 'hildesheim', name: 'Hildesheim', namePersian: 'هیلدسهایم' },
    { id: 'ingolstadt', name: 'Ingolstadt', namePersian: 'اینگولشتات' },
    { id: 'jena', name: 'Jena', namePersian: 'ینا' },
    { id: 'kassel', name: 'Kassel', namePersian: 'کاسل' },
    { id: 'kiel', name: 'Kiel', namePersian: 'کیل' },
    { id: 'koblenz', name: 'Koblenz', namePersian: 'کوبلنتس' },
    { id: 'krefeld', name: 'Krefeld', namePersian: 'کرفلد' },
    { id: 'leipzig', name: 'Leipzig', namePersian: 'لایپزیگ' },
    { id: 'leverkusen', name: 'Leverkusen', namePersian: 'لورکوزن' },
    { id: 'lubeck', name: 'Lübeck', namePersian: 'لوبک' },
    { id: 'ludwigshafen', name: 'Ludwigshafen', namePersian: 'لودویگسهافن' },
    { id: 'magdeburg', name: 'Magdeburg', namePersian: 'ماگدبورگ' },
    { id: 'mainz', name: 'Mainz', namePersian: 'ماینتس' },
    { id: 'mannheim', name: 'Mannheim', namePersian: 'مانهایم' },
    { id: 'monchengladbach', name: 'Mönchengladbach', namePersian: 'مونشن‌گلادباخ' },
    { id: 'moers', name: 'Moers', namePersian: 'مورس' },
    { id: 'munster', name: 'Münster', namePersian: 'مونستر' },
    { id: 'munich', name: 'Munich', namePersian: 'مونیخ' },
    { id: 'neuss', name: 'Neuss', namePersian: 'نویس' },
    { id: 'nuremberg', name: 'Nuremberg', namePersian: 'نورنبرگ' },
    { id: 'oberhausen', name: 'Oberhausen', namePersian: 'اوبرهاوزن' },
    { id: 'offenbach', name: 'Offenbach', namePersian: 'اوفن‌باخ' },
    { id: 'oldenburg', name: 'Oldenburg', namePersian: 'اولدنبورگ' },
    { id: 'osnabruck', name: 'Osnabrück', namePersian: 'اوسنابروک' },
    { id: 'paderborn', name: 'Paderborn', namePersian: 'پادربورن' },
    { id: 'pforzheim', name: 'Pforzheim', namePersian: 'پفورتسهایم' },
    { id: 'potsdam', name: 'Potsdam', namePersian: 'پوتسدام' },
    { id: 'recklinghausen', name: 'Recklinghausen', namePersian: 'رکلینگهاوزن' },
    { id: 'regensburg', name: 'Regensburg', namePersian: 'رگنسبورگ' },
    { id: 'remscheid', name: 'Remscheid', namePersian: 'رمشایت' },
    { id: 'reutlingen', name: 'Reutlingen', namePersian: 'رویتلینگن' },
    { id: 'rostock', name: 'Rostock', namePersian: 'روستوک' },
    { id: 'saarbrucken', name: 'Saarbrücken', namePersian: 'زاربروکن' },
    { id: 'salzgitter', name: 'Salzgitter', namePersian: 'زالتسگیتر' },
    { id: 'siegen', name: 'Siegen', namePersian: 'زیگن' },
    { id: 'solingen', name: 'Solingen', namePersian: 'زولینگن' },
    { id: 'stuttgart', name: 'Stuttgart', namePersian: 'اشتوتگارت' },
    { id: 'trier', name: 'Trier', namePersian: 'تریر' },
    { id: 'ulm', name: 'Ulm', namePersian: 'اولم' },
    { id: 'wiesbaden', name: 'Wiesbaden', namePersian: 'ویسبادن' },
    { id: 'wolfsburg', name: 'Wolfsburg', namePersian: 'وولفسبورگ' },
    { id: 'wuppertal', name: 'Wuppertal', namePersian: 'ووپرتال' },
    { id: 'wurzburg', name: 'Würzburg', namePersian: 'ورتسبورگ' }
  ],
  netherlands: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'alkmaar', name: 'Alkmaar', namePersian: 'آلکمار' },
    { id: 'almelo', name: 'Almelo', namePersian: 'آلملو' },
    { id: 'almere', name: 'Almere', namePersian: 'آلمره' },
    { id: 'alphen-aan-den-rijn', name: 'Alphen aan den Rijn', namePersian: 'آلفن آن دن راین' },
    { id: 'amersfoort', name: 'Amersfoort', namePersian: 'آمرسفورت' },
    { id: 'amsterdam', name: 'Amsterdam', namePersian: 'آمستردام' },
    { id: 'apeldoorn', name: 'Apeldoorn', namePersian: 'آپلدورن' },
    { id: 'arnhem', name: 'Arnhem', namePersian: 'آرنهم' },
    { id: 'assen', name: 'Assen', namePersian: 'آسن' },
    { id: 'bergen-op-zoom', name: 'Bergen op Zoom', namePersian: 'برگن اپ زوم' },
    { id: 'breda', name: 'Breda', namePersian: 'بردا' },
    { id: 'capelle-aan-den-ijssel', name: 'Capelle aan den IJssel', namePersian: 'کاپله آن دن آیسل' },
    { id: 'delft', name: 'Delft', namePersian: 'دلفت' },
    { id: 'deventer', name: 'Deventer', namePersian: 'دونتر' },
    { id: 'dordrecht', name: 'Dordrecht', namePersian: 'دوردرخت' },
    { id: 'ede', name: 'Ede', namePersian: 'اده' },
    { id: 'eindhoven', name: 'Eindhoven', namePersian: 'آیندهوون' },
    { id: 'emmen', name: 'Emmen', namePersian: 'امن' },
    { id: 'enschede', name: 'Enschede', namePersian: 'انسخده' },
    { id: 'gouda', name: 'Gouda', namePersian: 'گودا' },
    { id: 'groningen', name: 'Groningen', namePersian: 'گرونینگن' },
    { id: 'haarlem', name: 'Haarlem', namePersian: 'هارلم' },
    { id: 'haarlemmermeer', name: 'Haarlemmermeer', namePersian: 'هارلمرمیر' },
    { id: 'helmond', name: 'Helmond', namePersian: 'هلموند' },
    { id: 'hengelo', name: 'Hengelo', namePersian: 'هنگلو' },
    { id: 'hilversum', name: 'Hilversum', namePersian: 'هیلورسوم' },
    { id: 'hoogeveen', name: 'Hoogeveen', namePersian: 'هوگون' },
    { id: 'hoorn', name: 'Hoorn', namePersian: 'هورن' },
    { id: 'katwijk', name: 'Katwijk', namePersian: 'کاتویک' },
    { id: 'leeuwarden', name: 'Leeuwarden', namePersian: 'لیوواردن' },
    { id: 'leiden', name: 'Leiden', namePersian: 'لایدن' },
    { id: 'leidschendam-voorburg', name: 'Leidschendam-Voorburg', namePersian: 'لایدسخندام-فوربورخ' },
    { id: 'lelystad', name: 'Lelystad', namePersian: 'للی‌ستاد' },
    { id: 'maastricht', name: 'Maastricht', namePersian: 'ماستریخت' },
    { id: 'nieuwegein', name: 'Nieuwegein', namePersian: 'نیووگاین' },
    { id: 'nijmegen', name: 'Nijmegen', namePersian: 'نایمگن' },
    { id: 'oosterhout', name: 'Oosterhout', namePersian: 'اوسترهوت' },
    { id: 'oss', name: 'Oss', namePersian: 'اس' },
    { id: 'purmerend', name: 'Purmerend', namePersian: 'پورمرند' },
    { id: 'roosendaal', name: 'Roosendaal', namePersian: 'روزندال' },
    { id: 'rotterdam', name: 'Rotterdam', namePersian: 'روتردام' },
    { id: 's-hertogenbosch', name: "'s-Hertogenbosch", namePersian: 'سرتوگن‌بوس' },
    { id: 'schiedam', name: 'Schiedam', namePersian: 'سخیدام' },
    { id: 'schijndel', name: 'Schijndel', namePersian: 'سخایندل' },
    { id: 'sittard-geleen', name: 'Sittard-Geleen', namePersian: 'سیتارد-گلین' },
    { id: 'smallingerland', name: 'Smallingerland', namePersian: 'اسمالینگرلند' },
    { id: 'spijkenisse', name: 'Spijkenisse', namePersian: 'اسپایکنیسه' },
    { id: 'sudwest-fryslan', name: 'Súdwest-Fryslân', namePersian: 'سودوست-فریسلان' },
    { id: 'the-hague', name: 'The Hague', namePersian: 'لاهه' },
    { id: 'tilburg', name: 'Tilburg', namePersian: 'تیلبورخ' },
    { id: 'utrecht', name: 'Utrecht', namePersian: 'اوترخت' },
    { id: 'veenendaal', name: 'Veenendaal', namePersian: 'وینندال' },
    { id: 'velsen', name: 'Velsen', namePersian: 'ولسن' },
    { id: 'venlo', name: 'Venlo', namePersian: 'ونلو' },
    { id: 'vlaardingen', name: 'Vlaardingen', namePersian: 'ولاردینگن' },
    { id: 'westland', name: 'Westland', namePersian: 'وستلند' },
    { id: 'zaanstad', name: 'Zaanstad', namePersian: 'زان‌ستاد' },
    { id: 'zeist', name: 'Zeist', namePersian: 'زایست' },
    { id: 'zoetermeer', name: 'Zoetermeer', namePersian: 'زوترمیر' },
    { id: 'zutphen', name: 'Zutphen', namePersian: 'زوتفن' },
    { id: 'zwolle', name: 'Zwolle', namePersian: 'زووله' }
  ],
  france: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'aix-en-provence', name: 'Aix-en-Provence', namePersian: 'اکس-آن-پروانس' },
    { id: 'ajaccio', name: 'Ajaccio', namePersian: 'آژاکسیو' },
    { id: 'amiens', name: 'Amiens', namePersian: 'آمیان' },
    { id: 'angers', name: 'Angers', namePersian: 'آنژه' },
    { id: 'annecy', name: 'Annecy', namePersian: 'آنسی' },
    { id: 'antibes', name: 'Antibes', namePersian: 'آنتیب' },
    { id: 'argenteuil', name: 'Argenteuil', namePersian: 'آرژانتویل' },
    { id: 'asnieres-sur-seine', name: 'Asnières-sur-Seine', namePersian: 'آسنیر-سور-سن' },
    { id: 'aubervilliers', name: 'Aubervilliers', namePersian: 'اوبرویلیر' },
    { id: 'aulnay-sous-bois', name: 'Aulnay-sous-Bois', namePersian: 'اولنه-سو-بوا' },
    { id: 'avignon', name: 'Avignon', namePersian: 'آوینیون' },
    { id: 'besancon', name: 'Besançon', namePersian: 'برزانسون' },
    { id: 'beziers', name: 'Béziers', namePersian: 'بزیه' },
    { id: 'bordeaux', name: 'Bordeaux', namePersian: 'بوردو' },
    { id: 'boulogne-billancourt', name: 'Boulogne-Billancourt', namePersian: 'بولونی-بیانکور' },
    { id: 'bourges', name: 'Bourges', namePersian: 'بورژ' },
    { id: 'brest', name: 'Brest', namePersian: 'برست' },
    { id: 'caen', name: 'Caen', namePersian: 'کان' },
    { id: 'calais', name: 'Calais', namePersian: 'کاله' },
    { id: 'cannes', name: 'Cannes', namePersian: 'کن' },
    { id: 'champigny-sur-marne', name: 'Champigny-sur-Marne', namePersian: 'شامپینی-سور-مارن' },
    { id: 'clermont-ferrand', name: 'Clermont-Ferrand', namePersian: 'کلرمون-فران' },
    { id: 'colmar', name: 'Colmar', namePersian: 'کولمار' },
    { id: 'colombes', name: 'Colombes', namePersian: 'کولومب' },
    { id: 'courbevoie', name: 'Courbevoie', namePersian: 'کوربووا' },
    { id: 'creteil', name: 'Créteil', namePersian: 'کرتیل' },
    { id: 'dijon', name: 'Dijon', namePersian: 'دیژون' },
    { id: 'drancy', name: 'Drancy', namePersian: 'درانسی' },
    { id: 'dunkirk', name: 'Dunkirk', namePersian: 'دانکرک' },
    { id: 'fort-de-france', name: 'Fort-de-France', namePersian: 'فور-دو-فرانس' },
    { id: 'grenoble', name: 'Grenoble', namePersian: 'گرنوبل' },
    { id: 'issy-les-moulineaux', name: 'Issy-les-Moulineaux', namePersian: 'ایسی-لس-مولینو' },
    { id: 'la-rochelle', name: 'La Rochelle', namePersian: 'لا روشل' },
    { id: 'le-havre', name: 'Le Havre', namePersian: 'لو هاور' },
    { id: 'le-mans', name: 'Le Mans', namePersian: 'لو مان' },
    { id: 'le-tampon', name: 'Le Tampon', namePersian: 'لو تامپون' },
    { id: 'lille', name: 'Lille', namePersian: 'لیل' },
    { id: 'limoges', name: 'Limoges', namePersian: 'لیموژ' },
    { id: 'lyon', name: 'Lyon', namePersian: 'لیون' },
    { id: 'marseille', name: 'Marseille', namePersian: 'مارسی' },
    { id: 'merignac', name: 'Mérignac', namePersian: 'مرینیاک' },
    { id: 'metz', name: 'Metz', namePersian: 'متز' },
    { id: 'montpellier', name: 'Montpellier', namePersian: 'مونپلیه' },
    { id: 'montreuil', name: 'Montreuil', namePersian: 'مونترویل' },
    { id: 'mulhouse', name: 'Mulhouse', namePersian: 'مولوز' },
    { id: 'nancy', name: 'Nancy', namePersian: 'نانسی' },
    { id: 'nanterre', name: 'Nanterre', namePersian: 'نانتر' },
    { id: 'nantes', name: 'Nantes', namePersian: 'نانت' },
    { id: 'nice', name: 'Nice', namePersian: 'نیس' },
    { id: 'nimes', name: 'Nîmes', namePersian: 'نیم' },
    { id: 'orleans', name: 'Orléans', namePersian: 'اورلئان' },
    { id: 'paris', name: 'Paris', namePersian: 'پاریس' },
    { id: 'pau', name: 'Pau', namePersian: 'پو' },
    { id: 'perpignan', name: 'Perpignan', namePersian: 'پرپینیان' },
    { id: 'poitiers', name: 'Poitiers', namePersian: 'پواتیه' },
    { id: 'reims', name: 'Reims', namePersian: 'رنس' },
    { id: 'rennes', name: 'Rennes', namePersian: 'رن' },
    { id: 'roubaix', name: 'Roubaix', namePersian: 'روبه' },
    { id: 'rouen', name: 'Rouen', namePersian: 'روان' },
    { id: 'rueil-malmaison', name: 'Rueil-Malmaison', namePersian: 'رویل-مالمزون' },
    { id: 'saint-denis', name: 'Saint-Denis', namePersian: 'سن-دنی' },
    { id: 'saint-etienne', name: 'Saint-Étienne', namePersian: 'سن-اتین' },
    { id: 'saint-nazaire', name: 'Saint-Nazaire', namePersian: 'سن-نازر' },
    { id: 'saint-paul', name: 'Saint-Paul', namePersian: 'سن-پل' },
    { id: 'saint-pierre', name: 'Saint-Pierre', namePersian: 'سن-پیر' },
    { id: 'strasbourg', name: 'Strasbourg', namePersian: 'استراسبورگ' },
    { id: 'toulon', name: 'Toulon', namePersian: 'تولون' },
    { id: 'toulouse', name: 'Toulouse', namePersian: 'تولوز' },
    { id: 'tourcoing', name: 'Tourcoing', namePersian: 'تورکوان' },
    { id: 'tours', name: 'Tours', namePersian: 'تور' },
    { id: 'valence', name: 'Valence', namePersian: 'والانس' },
    { id: 'versailles', name: 'Versailles', namePersian: 'ورسای' },
    { id: 'villeurbanne', name: 'Villeurbanne', namePersian: 'ویلوربان' }
  ],
  romania: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'alba-iulia', name: 'Alba Iulia', namePersian: 'آلبا یولیا' },
    { id: 'alexandria', name: 'Alexandria', namePersian: 'الکساندریا' },
    { id: 'arad', name: 'Arad', namePersian: 'آراد' },
    { id: 'bacau', name: 'Bacău', namePersian: 'باکائو' },
    { id: 'baia-mare', name: 'Baia Mare', namePersian: 'بایا ماره' },
    { id: 'bistrita', name: 'Bistrița', namePersian: 'بیستریتسا' },
    { id: 'botosani', name: 'Botoșani', namePersian: 'بوتوشانی' },
    { id: 'brasov', name: 'Brașov', namePersian: 'براشوف' },
    { id: 'braila', name: 'Brăila', namePersian: 'برائیلا' },
    { id: 'bucharest', name: 'Bucharest (București)', namePersian: 'بخارست' },
    { id: 'buzau', name: 'Buzău', namePersian: 'بوزائو' },
    { id: 'calarasi', name: 'Călărași', namePersian: 'کالاراشی' },
    { id: 'cluj-napoca', name: 'Cluj-Napoca', namePersian: 'کلوژ-ناپوکا' },
    { id: 'constanta', name: 'Constanța', namePersian: 'کنستانتسا' },
    { id: 'craiova', name: 'Craiova', namePersian: 'کرایووا' },
    { id: 'deva', name: 'Deva', namePersian: 'دوا' },
    { id: 'drobeta-turnu-severin', name: 'Drobeta-Turnu Severin', namePersian: 'دروبتا-تورنو سورین' },
    { id: 'focsani', name: 'Focșani', namePersian: 'فوکشانی' },
    { id: 'galati', name: 'Galați', namePersian: 'گالاتسی' },
    { id: 'giurgiu', name: 'Giurgiu', namePersian: 'گیورگیو' },
    { id: 'iasi', name: 'Iași', namePersian: 'یاش' },
    { id: 'miercurea-ciuc', name: 'Miercurea Ciuc', namePersian: 'میرکوریا چیوک' },
    { id: 'oradea', name: 'Oradea', namePersian: 'اورادیا' },
    { id: 'piatra-neamt', name: 'Piatra Neamț', namePersian: 'پیاترا نیامتس' },
    { id: 'pitesti', name: 'Pitești', namePersian: 'پیتشتی' },
    { id: 'ploiesti', name: 'Ploiești', namePersian: 'پلویشتی' },
    { id: 'ramnicu-valcea', name: 'Râmnicu Vâlcea', namePersian: 'رامنیکو والچا' },
    { id: 'resita', name: 'Reșița', namePersian: 'رشیتسا' },
    { id: 'satu-mare', name: 'Satu Mare', namePersian: 'ساتو ماره' },
    { id: 'sfantu-gheorghe', name: 'Sfântu Gheorghe', namePersian: 'سفانتو گئورگه' },
    { id: 'sibiu', name: 'Sibiu', namePersian: 'سیبیو' },
    { id: 'sighisoara', name: 'Sighișoara', namePersian: 'سیگیشوارا' },
    { id: 'sinaia', name: 'Sinaia', namePersian: 'سینایا' },
    { id: 'slatina', name: 'Slatina', namePersian: 'اسلاتینا' },
    { id: 'slobozia', name: 'Slobozia', namePersian: 'اسلوبوزیا' },
    { id: 'suceava', name: 'Suceava', namePersian: 'سوچاوا' },
    { id: 'targoviste', name: 'Târgoviște', namePersian: 'تارگوویشته' },
    { id: 'targu-jiu', name: 'Târgu Jiu', namePersian: 'تارگو ژیو' },
    { id: 'targu-mures', name: 'Târgu Mureș', namePersian: 'تارگو موریش' },
    { id: 'timisoara', name: 'Timișoara', namePersian: 'تیمیشوارا' },
    { id: 'tulcea', name: 'Tulcea', namePersian: 'تولچا' },
    { id: 'vaslui', name: 'Vaslui', namePersian: 'واسلویی' },
    { id: 'zalau', name: 'Zalău', namePersian: 'زالائو' }
  ],
  portugal: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'almada', name: 'Almada', namePersian: 'آلمادا' },
    { id: 'amadora', name: 'Amadora', namePersian: 'آمادورا' },
    { id: 'aveiro', name: 'Aveiro', namePersian: 'آویرو' },
    { id: 'barreiro', name: 'Barreiro', namePersian: 'بارریرو' },
    { id: 'beja', name: 'Beja', namePersian: 'بژا' },
    { id: 'braga', name: 'Braga', namePersian: 'براگا' },
    { id: 'braganca', name: 'Bragança', namePersian: 'براگانسا' },
    { id: 'cascais', name: 'Cascais', namePersian: 'کاسکایس' },
    { id: 'castelo-branco', name: 'Castelo Branco', namePersian: 'کاستلو برانکو' },
    { id: 'coimbra', name: 'Coimbra', namePersian: 'کویمبرا' },
    { id: 'evora', name: 'Évora', namePersian: 'اوورا' },
    { id: 'faro', name: 'Faro', namePersian: 'فارو' },
    { id: 'funchal', name: 'Funchal (Madeira)', namePersian: 'فونشال (مادیرا)' },
    { id: 'guarda', name: 'Guarda', namePersian: 'گواردا' },
    { id: 'guimaraes', name: 'Guimarães', namePersian: 'گیمارائش' },
    { id: 'lagos', name: 'Lagos', namePersian: 'لاگوس' },
    { id: 'leiria', name: 'Leiria', namePersian: 'لیریا' },
    { id: 'lisbon', name: 'Lisbon (Lisboa)', namePersian: 'لیسبون' },
    { id: 'ponta-delgada', name: 'Ponta Delgada (Azores)', namePersian: 'پونتا دلگادا (آزور)' },
    { id: 'portalegre', name: 'Portalegre', namePersian: 'پورتالگره' },
    { id: 'portimao', name: 'Portimão', namePersian: 'پورتیمائو' },
    { id: 'porto', name: 'Porto', namePersian: 'پورتو' },
    { id: 'santarem', name: 'Santarém', namePersian: 'سانتارم' },
    { id: 'setubal', name: 'Setúbal', namePersian: 'ستوبال' },
    { id: 'sintra', name: 'Sintra', namePersian: 'سینترا' },
    { id: 'tomar', name: 'Tomar', namePersian: 'تومار' },
    { id: 'viana-do-castelo', name: 'Viana do Castelo', namePersian: 'ویانا دو کاستلو' },
    { id: 'vila-nova-de-gaia', name: 'Vila Nova de Gaia', namePersian: 'ویلا نووا دی گایا' },
    { id: 'vila-real', name: 'Vila Real', namePersian: 'ویلا ریال' },
    { id: 'viseu', name: 'Viseu', namePersian: 'ویزئو' }
  ],
  uae: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'abu-dhabi', name: 'Abu Dhabi', namePersian: 'ابوظبی' },
    { id: 'ajman', name: 'Ajman', namePersian: 'عجمان' },
    { id: 'al-ain', name: 'Al Ain', namePersian: 'العین' },
    { id: 'bur-dubai', name: 'Bur Dubai', namePersian: 'بر دبی' },
    { id: 'deira', name: 'Deira', namePersian: 'دیره' },
    { id: 'dibba-al-fujairah', name: 'Dibba Al-Fujairah', namePersian: 'دبا الفجیره' },
    { id: 'dibba-al-hisn', name: 'Dibba Al-Hisn', namePersian: 'دبا الحصن' },
    { id: 'dubai', name: 'Dubai', namePersian: 'دبی' },
    { id: 'fujairah', name: 'Fujairah', namePersian: 'فجیره' },
    { id: 'jumeirah', name: 'Jumeirah', namePersian: 'جمیرا' },
    { id: 'khalifa-city', name: 'Khalifa City', namePersian: 'شهر خلیفه' },
    { id: 'khor-fakkan', name: 'Khor Fakkan', namePersian: 'خورفکان' },
    { id: 'manama', name: 'Manama', namePersian: 'منامه' },
    { id: 'rams', name: 'Rams', namePersian: 'رامس' },
    { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', namePersian: 'راس الخیمه' },
    { id: 'sharjah', name: 'Sharjah', namePersian: 'شارجه' },
    { id: 'umm-al-quwain', name: 'Umm Al Quwain', namePersian: 'ام القیوین' },
    { id: 'zayed-city', name: 'Zayed City', namePersian: 'شهر زاید' }
  ],
  canada: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'brampton', name: 'Brampton', namePersian: 'برمپتون' },
    { id: 'calgary', name: 'Calgary', namePersian: 'کلگری' },
    { id: 'charlottetown', name: 'Charlottetown', namePersian: 'شارلوت‌تاون' },
    { id: 'edmonton', name: 'Edmonton', namePersian: 'ادمونتون' },
    { id: 'fredericton', name: 'Fredericton', namePersian: 'فردریکتون' },
    { id: 'gatineau', name: 'Gatineau', namePersian: 'گاتینو' },
    { id: 'guelph', name: 'Guelph', namePersian: 'گوئلف' },
    { id: 'halifax', name: 'Halifax', namePersian: 'هالیفکس' },
    { id: 'hamilton', name: 'Hamilton', namePersian: 'همیلتون' },
    { id: 'iqaluit', name: 'Iqaluit', namePersian: 'ایکالویت' },
    { id: 'kelowna', name: 'Kelowna', namePersian: 'کلونا' },
    { id: 'kingston', name: 'Kingston', namePersian: 'کینگستون' },
    { id: 'kitchener', name: 'Kitchener', namePersian: 'کیچنر' },
    { id: 'london', name: 'London', namePersian: 'لندن' },
    { id: 'laval', name: 'Laval', namePersian: 'لاوال' },
    { id: 'markham', name: 'Markham', namePersian: 'مارکهم' },
    { id: 'mississauga', name: 'Mississauga', namePersian: 'میسیساگا' },
    { id: 'moncton', name: 'Moncton', namePersian: 'مونکتون' },
    { id: 'montreal', name: 'Montreal', namePersian: 'مونترال' },
    { id: 'niagara-falls', name: 'Niagara Falls', namePersian: 'آبشار نیاگارا' },
    { id: 'oshawa', name: 'Oshawa', namePersian: 'اوشاوا' },
    { id: 'ottawa', name: 'Ottawa', namePersian: 'اوتاوا' },
    { id: 'quebec-city', name: 'Quebec City', namePersian: 'شهر کبک' },
    { id: 'regina', name: 'Regina', namePersian: 'رجینا' },
    { id: 'saint-john', name: 'Saint John', namePersian: 'سنت جان' },
    { id: 'saskatoon', name: 'Saskatoon', namePersian: 'ساسکاتون' },
    { id: 'sherbrooke', name: 'Sherbrooke', namePersian: 'شربروک' },
    { id: 'st-catharines', name: 'St. Catharines', namePersian: 'سنت کاترین' },
    { id: 'st-johns', name: 'St. John\'s', namePersian: 'سنت جانز' },
    { id: 'sudbury', name: 'Sudbury', namePersian: 'سادبری' },
    { id: 'surrey', name: 'Surrey', namePersian: 'ساری' },
    { id: 'thunder-bay', name: 'Thunder Bay', namePersian: 'تاندر بی' },
    { id: 'toronto', name: 'Toronto', namePersian: 'تورنتو' },
    { id: 'trois-rivieres', name: 'Trois-Rivières', namePersian: 'تروا ریویر' },
    { id: 'vancouver', name: 'Vancouver', namePersian: 'ونکوور' },
    { id: 'vaughan', name: 'Vaughan', namePersian: 'ووگان' },
    { id: 'victoria', name: 'Victoria', namePersian: 'ویکتوریا' },
    { id: 'whitehorse', name: 'Whitehorse', namePersian: 'وایت‌هورس' },
    { id: 'windsor', name: 'Windsor', namePersian: 'ویندزور' },
    { id: 'winnipeg', name: 'Winnipeg', namePersian: 'وینی‌پگ' },
    { id: 'yellowknife', name: 'Yellowknife', namePersian: 'یلونایف' }
  ],
  qatar: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'doha', name: 'Doha', namePersian: 'دوحه' },
    { id: 'al-rayyan', name: 'Al Rayyan', namePersian: 'الریان' },
    { id: 'al-wakrah', name: 'Al Wakrah', namePersian: 'الوکره' },
    { id: 'al-khor', name: 'Al Khor', namePersian: 'الخور' },
    { id: 'dukhan', name: 'Dukhan', namePersian: 'دخان' }
  ],
  kuwait: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'adan', name: 'Adan', namePersian: 'عدان' },
    { id: 'ahmadi', name: 'Ahmadi', namePersian: 'احمدی' },
    { id: 'bayan', name: 'Bayan', namePersian: 'بیان' },
    { id: 'dasman', name: 'Dasman', namePersian: 'دسمان' },
    { id: 'fahaheel', name: 'Fahaheel', namePersian: 'فحاحیل' },
    { id: 'farwaniya', name: 'Farwaniya', namePersian: 'فروانیه' },
    { id: 'hawalli', name: 'Hawalli', namePersian: 'حولی' },
    { id: 'jabriya', name: 'Jabriya', namePersian: 'جابریه' },
    { id: 'jahra', name: 'Jahra', namePersian: 'جهراء' },
    { id: 'jleeb-al-shuyoukh', name: 'Jleeb Al-Shuyoukh', namePersian: 'جلیب الشیوخ' },
    { id: 'kuwait-city', name: 'Kuwait City', namePersian: 'شهر کویت' },
    { id: 'mahboula', name: 'Mahboula', namePersian: 'محبوله' },
    { id: 'mirqab', name: 'Mirqab', namePersian: 'مرقاب' },
    { id: 'mubarak-al-kabeer', name: 'Mubarak Al-Kabeer', namePersian: 'مبارک الکبیر' },
    { id: 'rabiya', name: 'Rabiya', namePersian: 'الرابیه' },
    { id: 'sabah-as-salem', name: 'Sabah As-Salem', namePersian: 'صباح السالم' },
    { id: 'salmiya', name: 'Salmiya', namePersian: 'سالمیه' },
    { id: 'sharq', name: 'Sharq', namePersian: 'شرق' },
    { id: 'sulaibiya', name: 'Sulaibiya', namePersian: 'صلیبیه' },
    { id: 'taima', name: 'Taima', namePersian: 'تیماء' }
  ],
  turkey: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'adapazari', name: 'Adapazari', namePersian: 'آداپازاری' },
    { id: 'adana', name: 'Adana', namePersian: 'آدانا' },
    { id: 'adiyaman', name: 'Adiyaman', namePersian: 'آدیامان' },
    { id: 'afyon', name: 'Afyon', namePersian: 'آفیون' },
    { id: 'agri', name: 'Agri', namePersian: 'آغری' },
    { id: 'aksaray', name: 'Aksaray', namePersian: 'آکسارای' },
    { id: 'amasya', name: 'Amasya', namePersian: 'آماسیا' },
    { id: 'ankara', name: 'Ankara', namePersian: 'آنکارا' },
    { id: 'antalya', name: 'Antalya', namePersian: 'آنتالیا' },
    { id: 'ardahan', name: 'Ardahan', namePersian: 'آرداهان' },
    { id: 'artvin', name: 'Artvin', namePersian: 'آرتوین' },
    { id: 'aydin', name: 'Aydin', namePersian: 'آیدین' },
    { id: 'balikesir', name: 'Balikesir', namePersian: 'بالیکسیر' },
    { id: 'bartin', name: 'Bartin', namePersian: 'بارتین' },
    { id: 'batman', name: 'Batman', namePersian: 'باتمان' },
    { id: 'bayburt', name: 'Bayburt', namePersian: 'بایبورت' },
    { id: 'bilecik', name: 'Bilecik', namePersian: 'بیلجیک' },
    { id: 'bingol', name: 'Bingol', namePersian: 'بینگول' },
    { id: 'bitlis', name: 'Bitlis', namePersian: 'بیتلیس' },
    { id: 'bolu', name: 'Bolu', namePersian: 'بولو' },
    { id: 'burdur', name: 'Burdur', namePersian: 'بوردور' },
    { id: 'bursa', name: 'Bursa', namePersian: 'بورسا' },
    { id: 'canakkale', name: 'Canakkale', namePersian: 'چاناکاله' },
    { id: 'cankiri', name: 'Cankiri', namePersian: 'چانکیری' },
    { id: 'corum', name: 'Corum', namePersian: 'چوروم' },
    { id: 'denizli', name: 'Denizli', namePersian: 'دنیزلی' },
    { id: 'diyarbakir', name: 'Diyarbakir', namePersian: 'دیاربکر' },
    { id: 'duzce', name: 'Duzce', namePersian: 'دوزجه' },
    { id: 'edirne', name: 'Edirne', namePersian: 'ادیرنه' },
    { id: 'elazig', name: 'Elazig', namePersian: 'الازیغ' },
    { id: 'erzincan', name: 'Erzincan', namePersian: 'ارزینجان' },
    { id: 'erzurum', name: 'Erzurum', namePersian: 'ارزروم' },
    { id: 'eskisehir', name: 'Eskisehir', namePersian: 'اسکی‌شهیر' },
    { id: 'gaziantep', name: 'Gaziantep', namePersian: 'غازی‌عنتپ' },
    { id: 'giresun', name: 'Giresun', namePersian: 'گیرسون' },
    { id: 'gumushane', name: 'Gumushane', namePersian: 'گوموشخانه' },
    { id: 'hakkari', name: 'Hakkari', namePersian: 'هکاری' },
    { id: 'hatay', name: 'Hatay', namePersian: 'هاتای' },
    { id: 'igdir', name: 'Igdir', namePersian: 'ایغدیر' },
    { id: 'isparta', name: 'Isparta', namePersian: 'اسپارتا' },
    { id: 'istanbul', name: 'Istanbul', namePersian: 'استانبول' },
    { id: 'izmir', name: 'Izmir', namePersian: 'ازمیر' },
    { id: 'kahramanmaras', name: 'Kahramanmaras', namePersian: 'کهرمان‌مراش' },
    { id: 'karabuk', name: 'Karabuk', namePersian: 'کارابوک' },
    { id: 'karaman', name: 'Karaman', namePersian: 'کارامان' },
    { id: 'kars', name: 'Kars', namePersian: 'کارس' },
    { id: 'kastamonu', name: 'Kastamonu', namePersian: 'کاستامونو' },
    { id: 'kayseri', name: 'Kayseri', namePersian: 'قیصری' },
    { id: 'kirikkale', name: 'Kirikkale', namePersian: 'کیریکاله' },
    { id: 'kirklareli', name: 'Kirklareli', namePersian: 'کیرکلارلی' },
    { id: 'kirsehir', name: 'Kirsehir', namePersian: 'کیرشهیر' },
    { id: 'kilis', name: 'Kilis', namePersian: 'کیلیس' },
    { id: 'kocaeli', name: 'Kocaeli', namePersian: 'کوجائلی' },
    { id: 'konya', name: 'Konya', namePersian: 'قونیه' },
    { id: 'kutahya', name: 'Kutahya', namePersian: 'کوتاهیا' },
    { id: 'malatya', name: 'Malatya', namePersian: 'ملاطیا' },
    { id: 'manisa', name: 'Manisa', namePersian: 'مانیسا' },
    { id: 'mardin', name: 'Mardin', namePersian: 'ماردین' },
    { id: 'mersin', name: 'Mersin', namePersian: 'مرسین' },
    { id: 'mugla', name: 'Mugla', namePersian: 'موغلا' },
    { id: 'mus', name: 'Mus', namePersian: 'موش' },
    { id: 'nevsehir', name: 'Nevsehir', namePersian: 'نوشهیر' },
    { id: 'nigde', name: 'Nigde', namePersian: 'نیغده' },
    { id: 'ordu', name: 'Ordu', namePersian: 'اوردو' },
    { id: 'osmaniye', name: 'Osmaniye', namePersian: 'عثمانیه' },
    { id: 'rize', name: 'Rize', namePersian: 'ریزه' },
    { id: 'sakarya', name: 'Sakarya', namePersian: 'ساکاریا' },
    { id: 'samsun', name: 'Samsun', namePersian: 'سامسون' },
    { id: 'sanliurfa', name: 'Sanliurfa', namePersian: 'شانلی‌اورفا' },
    { id: 'siirt', name: 'Siirt', namePersian: 'سیرت' },
    { id: 'sinop', name: 'Sinop', namePersian: 'سینوپ' },
    { id: 'sirnak', name: 'Sirnak', namePersian: 'شیرناک' },
    { id: 'sivas', name: 'Sivas', namePersian: 'سیواس' },
    { id: 'tekirdag', name: 'Tekirdag', namePersian: 'تکیرداغ' },
    { id: 'tokat', name: 'Tokat', namePersian: 'توکات' },
    { id: 'trabzon', name: 'Trabzon', namePersian: 'ترابزون' },
    { id: 'tunceli', name: 'Tunceli', namePersian: 'تونجلی' },
    { id: 'usak', name: 'Usak', namePersian: 'اوشاک' },
    { id: 'van', name: 'Van', namePersian: 'وان' },
    { id: 'yalova', name: 'Yalova', namePersian: 'یالوا' },
    { id: 'yozgat', name: 'Yozgat', namePersian: 'یوزگات' },
    { id: 'zonguldak', name: 'Zonguldak', namePersian: 'زونگولداک' }
  ],
  thailand: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'ayutthaya', name: 'Ayutthaya', namePersian: 'آیوتایا' },
    { id: 'bangkok', name: 'Bangkok (Krung Thep Maha Nakhon)', namePersian: 'بانکوک (گرونگ تپ مها نکون)' },
    { id: 'buriram', name: 'Buriram', namePersian: 'بوری‌رام' },
    { id: 'chachoengsao', name: 'Chachoengsao', namePersian: 'چاچوئنگ‌سائو' },
    { id: 'chaiyaphum', name: 'Chaiyaphum', namePersian: 'چایا‌پوم' },
    { id: 'chanthaburi', name: 'Chanthaburi', namePersian: 'چانتابوری' },
    { id: 'chiang-mai', name: 'Chiang Mai', namePersian: 'چیانگ مای' },
    { id: 'chiang-rai', name: 'Chiang Rai', namePersian: 'چیانگ رای' },
    { id: 'chon-buri', name: 'Chon Buri', namePersian: 'چون بوری' },
    { id: 'chumphon', name: 'Chumphon', namePersian: 'چومپون' },
    { id: 'hat-yai', name: 'Hat Yai', namePersian: 'هات یای' },
    { id: 'hua-hin', name: 'Hua Hin', namePersian: 'هوا هین' },
    { id: 'kalasin', name: 'Kalasin', namePersian: 'کالاسین' },
    { id: 'kamphaeng-phet', name: 'Kamphaeng Phet', namePersian: 'کامپنگ پت' },
    { id: 'kanchanaburi', name: 'Kanchanaburi', namePersian: 'کانچانابوری' },
    { id: 'khon-kaen', name: 'Khon Kaen', namePersian: 'خون کائن' },
    { id: 'krabi', name: 'Krabi', namePersian: 'کرابی' },
    { id: 'lampang', name: 'Lampang', namePersian: 'لامپانگ' },
    { id: 'lamphun', name: 'Lamphun', namePersian: 'لامپون' },
    { id: 'loei', name: 'Loei', namePersian: 'لوئی' },
    { id: 'lopburi', name: 'Lopburi', namePersian: 'لوپ‌بوری' },
    { id: 'mae-hong-son', name: 'Mae Hong Son', namePersian: 'مه هونگ سون' },
    { id: 'maha-sarakham', name: 'Maha Sarakham', namePersian: 'مها ساراکهام' },
    { id: 'mukdahan', name: 'Mukdahan', namePersian: 'موکداهان' },
    { id: 'nakhon-pathom', name: 'Nakhon Pathom', namePersian: 'ناخون پاتوم' },
    { id: 'nakhon-phanom', name: 'Nakhon Phanom', namePersian: 'ناخون پانوم' },
    { id: 'nakhon-ratchasima', name: 'Nakhon Ratchasima (Korat)', namePersian: 'ناخون راچاسیما (کورات)' },
    { id: 'nakhon-sawan', name: 'Nakhon Sawan', namePersian: 'ناخون ساوان' },
    { id: 'nakhon-si-thammarat', name: 'Nakhon Si Thammarat', namePersian: 'ناخون سی تامارات' },
    { id: 'nan', name: 'Nan', namePersian: 'نان' },
    { id: 'narathiwat', name: 'Narathiwat', namePersian: 'ناراتیوات' },
    { id: 'nonthaburi', name: 'Nonthaburi', namePersian: 'نونتابوری' },
    { id: 'pai', name: 'Pai', namePersian: 'پای' },
    { id: 'pak-kret', name: 'Pak Kret', namePersian: 'پاک کرت' },
    { id: 'pattani', name: 'Pattani', namePersian: 'پاتانی' },
    { id: 'pattaya', name: 'Pattaya', namePersian: 'پاتایا' },
    { id: 'phang-nga', name: 'Phang Nga', namePersian: 'پانگ نگا' },
    { id: 'phatthalung', name: 'Phatthalung', namePersian: 'پاتالونگ' },
    { id: 'phayao', name: 'Phayao', namePersian: 'پایائو' },
    { id: 'phetchabun', name: 'Phetchabun', namePersian: 'پچابون' },
    { id: 'phetchaburi', name: 'Phetchaburi', namePersian: 'پچابوری' },
    { id: 'phichit', name: 'Phichit', namePersian: 'پیچیت' },
    { id: 'phitsanulok', name: 'Phitsanulok', namePersian: 'پیتسانولوک' },
    { id: 'phrae', name: 'Phrae', namePersian: 'پرای' },
    { id: 'phuket-city', name: 'Phuket (City)', namePersian: 'فوکت (شهر)' },
    { id: 'prachuap-khiri-khan', name: 'Prachuap Khiri Khan', namePersian: 'پراچواپ کیری خان' },
    { id: 'ratchaburi', name: 'Ratchaburi', namePersian: 'راچابوری' },
    { id: 'rayong', name: 'Rayong', namePersian: 'رایونگ' },
    { id: 'roi-et', name: 'Roi Et', namePersian: 'روی ات' },
    { id: 'sa-kaeo', name: 'Sa Kaeo', namePersian: 'سا کائو' },
    { id: 'sakon-nakhon', name: 'Sakon Nakhon', namePersian: 'ساکون ناخون' },
    { id: 'samut-prakan', name: 'Samut Prakan', namePersian: 'سموت پراکان' },
    { id: 'samut-sakhon', name: 'Samut Sakhon', namePersian: 'سموت ساخون' },
    { id: 'saraburi', name: 'Saraburi', namePersian: 'ساراบوری' },
    { id: 'satun', name: 'Satun', namePersian: 'ساتون' },
    { id: 'sisaket', name: 'Sisaket', namePersian: 'سیساکت' },
    { id: 'songkhla', name: 'Songkhla', namePersian: 'سونگ‌کلا' },
    { id: 'sukhothai', name: 'Sukhothai', namePersian: 'سوخوتای' },
    { id: 'suphan-buri', name: 'Suphan Buri', namePersian: 'سوپان بوری' },
    { id: 'surat-thani', name: 'Surat Thani', namePersian: 'سورات تانی' },
    { id: 'surin', name: 'Surin', namePersian: 'سورین' },
    { id: 'tak', name: 'Tak', namePersian: 'تاک' },
    { id: 'trang', name: 'Trang', namePersian: 'ترانگ' },
    { id: 'trat', name: 'Trat', namePersian: 'ترات' },
    { id: 'ubon-ratchathani', name: 'Ubon Ratchathani', namePersian: 'اوبون راچاتانی' },
    { id: 'udon-thani', name: 'Udon Thani', namePersian: 'اودون تانی' },
    { id: 'yala', name: 'Yala', namePersian: 'یالا' }
  ],
  greece: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'agrinio', name: 'Agrinio', namePersian: 'آگرینیو' },
    { id: 'agios-nikolaos', name: 'Agios Nikolaos', namePersian: 'آگیوس نیکولاوس' },
    { id: 'alexandroupoli', name: 'Alexandroupoli', namePersian: 'الکساندروپولی' },
    { id: 'argostoli', name: 'Argostoli', namePersian: 'آرگوستولی' },
    { id: 'arta', name: 'Arta', namePersian: 'آرتا' },
    { id: 'athens', name: 'Athens (Athina)', namePersian: 'آتن (آتینا)' },
    { id: 'chalcis', name: 'Chalcis (Chalkida)', namePersian: 'خالکیس (خالکیدا)' },
    { id: 'chania', name: 'Chania', namePersian: 'خانیا' },
    { id: 'chios', name: 'Chios', namePersian: 'خیوس' },
    { id: 'corfu', name: 'Corfu (Kerkyra)', namePersian: 'کورفو (کرکیرا)' },
    { id: 'corinth', name: 'Corinth (Korinthos)', namePersian: 'کورینتوس (کورینتوس)' },
    { id: 'delphi', name: 'Delphi', namePersian: 'دلفی' },
    { id: 'drama', name: 'Drama', namePersian: 'دراما' },
    { id: 'edessa', name: 'Edessa', namePersian: 'ادسا' },
    { id: 'ermoupoli', name: 'Ermoupoli', namePersian: 'ارموپولی' },
    { id: 'fira', name: 'Fira (Santorini)', namePersian: 'فیرا (سانتورینی)' },
    { id: 'florina', name: 'Florina', namePersian: 'فلورینا' },
    { id: 'grevena', name: 'Grevena', namePersian: 'گروونا' },
    { id: 'heraklion', name: 'Heraklion', namePersian: 'هراکلیون' },
    { id: 'igoumenitsa', name: 'Igoumenitsa', namePersian: 'ایگومنیتسا' },
    { id: 'ioannina', name: 'Ioannina', namePersian: 'یوآنینا' },
    { id: 'kalamata', name: 'Kalamata', namePersian: 'کالاماتا' },
    { id: 'karditsa', name: 'Karditsa', namePersian: 'کاردیتسا' },
    { id: 'karpenisi', name: 'Karpenisi', namePersian: 'کارپنیسی' },
    { id: 'kastoria', name: 'Kastoria', namePersian: 'کاستوریا' },
    { id: 'katerini', name: 'Katerini', namePersian: 'کاترینی' },
    { id: 'kavala', name: 'Kavala', namePersian: 'کاوالا' },
    { id: 'kilkis', name: 'Kilkis', namePersian: 'کیلکیس' },
    { id: 'komotini', name: 'Komotini', namePersian: 'کوموتینی' },
    { id: 'kozani', name: 'Kozani', namePersian: 'کوزانی' },
    { id: 'lamia', name: 'Lamia', namePersian: 'لامیا' },
    { id: 'larissa', name: 'Larissa', namePersian: 'لاریسا' },
    { id: 'lefkada', name: 'Lefkada', namePersian: 'لفکادا' },
    { id: 'livadeia', name: 'Livadeia', namePersian: 'لیوادیا' },
    { id: 'mykonos-town', name: 'Mykonos Town', namePersian: 'شهر میکونوس' },
    { id: 'mytilene', name: 'Mytilene', namePersian: 'میتیلن' },
    { id: 'nafplio', name: 'Nafplio', namePersian: 'ناپلیو' },
    { id: 'olympia', name: 'Olympia', namePersian: 'المپیا' },
    { id: 'patras', name: 'Patras', namePersian: 'پاتراس' },
    { id: 'piraeus', name: 'Piraeus', namePersian: 'پیرئوس' },
    { id: 'polygyros', name: 'Polygyros', namePersian: 'پولیژیروس' },
    { id: 'preveza', name: 'Preveza', namePersian: 'پروزا' },
    { id: 'pyrgos', name: 'Pyrgos', namePersian: 'پیرگوس' },
    { id: 'rethymno', name: 'Rethymno', namePersian: 'رتیمنو' },
    { id: 'rhodes', name: 'Rhodes (Rodos)', namePersian: 'رودس (رودوس)' },
    { id: 'samos', name: 'Samos', namePersian: 'ساموس' },
    { id: 'serres', name: 'Serres', namePersian: 'سرس' },
    { id: 'sparta', name: 'Sparta (Sparti)', namePersian: 'اسپارت (اسپارتی)' },
    { id: 'thessaloniki', name: 'Thessaloniki', namePersian: 'تسالونیکی' },
    { id: 'trikala', name: 'Trikala', namePersian: 'تریکالا' },
    { id: 'tripoli', name: 'Tripoli', namePersian: 'تریپولی' },
    { id: 'veria', name: 'Veria', namePersian: 'وریا' },
    { id: 'volos', name: 'Volos', namePersian: 'ولوس' },
    { id: 'xanthi', name: 'Xanthi', namePersian: 'زانتی' },
    { id: 'zakynthos', name: 'Zakynthos', namePersian: 'زاکینتوس' }
  ],
  norway: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'ålesund', name: 'Ålesund', namePersian: 'آلسوند' },
    { id: 'arendal', name: 'Arendal', namePersian: 'آرندال' },
    { id: 'askim', name: 'Askim', namePersian: 'آسکیم' },
    { id: 'bergen', name: 'Bergen', namePersian: 'برگن' },
    { id: 'bodø', name: 'Bodø', namePersian: 'بودو' },
    { id: 'brevik', name: 'Brevik', namePersian: 'برویک' },
    { id: 'brumunddal', name: 'Brumunddal', namePersian: 'برومندال' },
    { id: 'bryne', name: 'Bryne', namePersian: 'برینه' },
    { id: 'bærum', name: 'Bærum', namePersian: 'بروم' },
    { id: 'drøbak', name: 'Drøbak', namePersian: 'دروباک' },
    { id: 'drammen', name: 'Drammen', namePersian: 'درامن' },
    { id: 'egersund', name: 'Egersund', namePersian: 'اگرسوند' },
    { id: 'elverum', name: 'Elverum', namePersian: 'الوروم' },
    { id: 'farsund', name: 'Farsund', namePersian: 'فارسوند' },
    { id: 'fauske', name: 'Fauske', namePersian: 'فائوسکه' },
    { id: 'finnsnes', name: 'Finnsnes', namePersian: 'فینسنس' },
    { id: 'flekkefjord', name: 'Flekkefjord', namePersian: 'فلکه‌فیورد' },
    { id: 'florø', name: 'Florø', namePersian: 'فلورو' },
    { id: 'fredrikstad', name: 'Fredrikstad', namePersian: 'فردریکستاد' },
    { id: 'gjøvik', name: 'Gjøvik', namePersian: 'یوویک' },
    { id: 'grimstad', name: 'Grimstad', namePersian: 'گریمستاد' },
    { id: 'halden', name: 'Halden', namePersian: 'هالدن' },
    { id: 'hamar', name: 'Hamar', namePersian: 'هامار' },
    { id: 'hammerfest', name: 'Hammerfest', namePersian: 'همرفست' },
    { id: 'harstad', name: 'Harstad', namePersian: 'هارستاد' },
    { id: 'haugesund', name: 'Haugesund', namePersian: 'هائوگسوند' },
    { id: 'horten', name: 'Horten', namePersian: 'هورتن' },
    { id: 'jessheim', name: 'Jessheim', namePersian: 'یسهایم' },
    { id: 'kirkenes', name: 'Kirkenes', namePersian: 'کیرکنس' },
    { id: 'kongsberg', name: 'Kongsberg', namePersian: 'کونگسبرگ' },
    { id: 'kongsvinger', name: 'Kongsvinger', namePersian: 'کونگسوینگر' },
    { id: 'kopervik', name: 'Kopervik', namePersian: 'کوپرویک' },
    { id: 'kristiansand', name: 'Kristiansand', namePersian: 'کریستیانساند' },
    { id: 'kristiansund', name: 'Kristiansund', namePersian: 'کریستیانسوند' },
    { id: 'langesund', name: 'Langesund', namePersian: 'لانگسوند' },
    { id: 'larvik', name: 'Larvik', namePersian: 'لارویک' },
    { id: 'leknes', name: 'Leknes', namePersian: 'لکنس' },
    { id: 'lillehammer', name: 'Lillehammer', namePersian: 'لیله‌همر' },
    { id: 'lillestr��m', name: 'Lillestrøm', namePersian: 'لیله‌ستروم' },
    { id: 'lillesand', name: 'Lillesand', namePersian: 'لیله‌ساند' },
    { id: 'lyngdal', name: 'Lyngdal', namePersian: 'لینگدال' },
    { id: 'mandal', name: 'Mandal', namePersian: 'ماندال' },
    { id: 'mo-i-rana', name: 'Mo i Rana', namePersian: 'مو ای رانا' },
    { id: 'molde', name: 'Molde', namePersian: 'مولده' },
    { id: 'mosjøen', name: 'Mosjøen', namePersian: 'موسیون' },
    { id: 'moss', name: 'Moss', namePersian: 'موس' },
    { id: 'namsos', name: 'Namsos', namePersian: 'نامسوس' },
    { id: 'notodden', name: 'Notodden', namePersian: 'نوتودن' },
    { id: 'odda', name: 'Odda', namePersian: 'اودا' },
    { id: 'oslo', name: 'Oslo', namePersian: 'اسلو' },
    { id: 'porsgrunn', name: 'Porsgrunn', namePersian: 'پورسگرون' },
    { id: 'rjukan', name: 'Rjukan', namePersian: 'ریوکان' },
    { id: 'sandefjord', name: 'Sandefjord', namePersian: 'ساندفیورد' },
    { id: 'sandnes', name: 'Sandnes', namePersian: 'ساندنس' },
    { id: 'sarpsborg', name: 'Sarpsborg', namePersian: 'سارپسبورگ' },
    { id: 'ski', name: 'Ski', namePersian: 'اسکی' },
    { id: 'skien', name: 'Skien', namePersian: 'اسکین' },
    { id: 'sortland', name: 'Sortland', namePersian: 'سورتلاند' },
    { id: 'stavanger', name: 'Stavanger', namePersian: 'استاوانگر' },
    { id: 'steinkjer', name: 'Steinkjer', namePersian: 'استاین‌چر' },
    { id: 'stord', name: 'Stord', namePersian: 'استورد' },
    { id: 'tromsø', name: 'Tromsø', namePersian: 'ترومسو' },
    { id: 'trondheim', name: 'Trondheim', namePersian: 'تروندهایم' },
    { id: 'tvedestrand', name: 'Tvedestrand', namePersian: 'توده‌استراند' },
    { id: 'tønsberg', name: 'Tønsberg', namePersian: 'تونسبرگ' },
    { id: 'vardø', name: 'Vardø', namePersian: 'واردو' },
    { id: 'vadsø', name: 'Vadsø', namePersian: 'وادسو' },
    { id: 'verdal', name: 'Verdal', namePersian: 'وردال' }
  ],
  australia: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'adelaide', name: 'Adelaide', namePersian: 'آدلاید' },
    { id: 'albany', name: 'Albany', namePersian: 'آلبانی' },
    { id: 'alice-springs', name: 'Alice Springs', namePersian: 'آلیس اسپرینگز' },
    { id: 'armidale', name: 'Armidale', namePersian: 'آرمیدل' },
    { id: 'ballarat', name: 'Ballarat', namePersian: 'بالارات' },
    { id: 'bamaga', name: 'Bamaga', namePersian: 'باماگا' },
    { id: 'bega', name: 'Bega', namePersian: 'بگا' },
    { id: 'bendigo', name: 'Bendigo', namePersian: 'بندیگو' },
    { id: 'brisbane', name: 'Brisbane', namePersian: 'بریزبن' },
    { id: 'broome', name: 'Broome', namePersian: 'بروم' },
    { id: 'bunbury', name: 'Bunbury', namePersian: 'بانبری' },
    { id: 'bundaberg', name: 'Bundaberg', namePersian: 'بانداबرگ' },
    { id: 'burnie', name: 'Burnie', namePersian: 'برنی' },
    { id: 'byron-bay', name: 'Byron Bay', namePersian: 'بایرون بی' },
    { id: 'cairns', name: 'Cairns', namePersian: 'کیرنز' },
    { id: 'caloundra', name: 'Caloundra', namePersian: 'کالوندرا' },
    { id: 'canberra', name: 'Canberra', namePersian: 'کانبرا' },
    { id: 'cessnock', name: 'Cessnock', namePersian: 'ساسنوک' },
    { id: 'charters-towers', name: 'Charters Towers', namePersian: 'چارترز تاورز' },
    { id: 'coffs-harbour', name: 'Coffs Harbour', namePersian: 'کافز هاربر' },
    { id: 'colac', name: 'Colac', namePersian: 'کولاک' },
    { id: 'darwin', name: 'Darwin', namePersian: 'داروین' },
    { id: 'devonport', name: 'Devonport', namePersian: 'دونپورت' },
    { id: 'dubbo', name: 'Dubbo', namePersian: 'دابو' },
    { id: 'echuca', name: 'Echuca', namePersian: 'اچوکا' },
    { id: 'geelong', name: 'Geelong', namePersian: 'جیلونگ' },
    { id: 'geraldton', name: 'Geraldton', namePersian: 'جرالدتون' },
    { id: 'gladstone', name: 'Gladstone', namePersian: 'گلدستون' },
    { id: 'gold-coast', name: 'Gold Coast', namePersian: 'گلد کوست' },
    { id: 'goulburn', name: 'Goulburn', namePersian: 'گولبرن' },
    { id: 'grafton', name: 'Grafton', namePersian: 'گرافتون' },
    { id: 'hervey-bay', name: 'Hervey Bay', namePersian: 'هروی بی' },
    { id: 'hobart', name: 'Hobart', namePersian: 'هوبارت' },
    { id: 'kalgoorlie', name: 'Kalgoorlie', namePersian: 'کالگورلی' },
    { id: 'katoomba', name: 'Katoomba', namePersian: 'کاتومبا' },
    { id: 'karratha', name: 'Karratha', namePersian: 'کاراتا' },
    { id: 'kempsey', name: 'Kempsey', namePersian: 'کمپسی' },
    { id: 'launceston', name: 'Launceston', namePersian: 'لانسستون' },
    { id: 'lismore', name: 'Lismore', namePersian: 'لیسمور' },
    { id: 'mackay', name: 'Mackay', namePersian: 'مکای' },
    { id: 'maitland', name: 'Maitland', namePersian: 'میتلند' },
    { id: 'mandurah', name: 'Mandurah', namePersian: 'ماندورا' },
    { id: 'maryborough', name: 'Maryborough', namePersian: 'مریبرا' },
    { id: 'melbourne', name: 'Melbourne', namePersian: 'ملبورن' },
    { id: 'mildura', name: 'Mildura', namePersian: 'میلدورا' },
    { id: 'mount-gambier', name: 'Mount Gambier', namePersian: 'مونت گمبیر' },
    { id: 'mount-isa', name: 'Mount Isa', namePersian: 'مونت آیسا' },
    { id: 'newcastle', name: 'Newcastle', namePersian: 'نیوکاسل' },
    { id: 'nowra', name: 'Nowra', namePersian: 'نورا' },
    { id: 'orange', name: 'Orange', namePersian: 'اورنج' },
    { id: 'perth', name: 'Perth', namePersian: 'پرت' },
    { id: 'port-augusta', name: 'Port Augusta', namePersian: 'پورت آگوستا' },
    { id: 'port-hedland', name: 'Port Hedland', namePersian: 'پورت هدلند' },
    { id: 'port-macquarie', name: 'Port Macquarie', namePersian: 'پورت مکواری' },
    { id: 'rockhampton', name: 'Rockhampton', namePersian: 'راکهمپتون' },
    { id: 'sale', name: 'Sale', namePersian: 'سیل' },
    { id: 'shepparton', name: 'Shepparton', namePersian: 'شپارتون' },
    { id: 'sunshine-coast', name: 'Sunshine Coast', namePersian: 'سانشاین کوست' },
    { id: 'sydney', name: 'Sydney', namePersian: 'سیدنی' },
    { id: 'tamworth', name: 'Tamworth', namePersian: 'تمورث' },
    { id: 'toowoomba', name: 'Toowoomba', namePersian: 'توومبا' },
    { id: 'townsville', name: 'Townsville', namePersian: 'تاونزویل' },
    { id: 'traralgon', name: 'Traralgon', namePersian: 'ترارالگون' },
    { id: 'wagga-wagga', name: 'Wagga Wagga', namePersian: 'واگا واگا' },
    { id: 'warrnambool', name: 'Warrnambool', namePersian: 'واررنامبول' },
    { id: 'wodonga', name: 'Wodonga', namePersian: 'ودونگا' },
    { id: 'wollongong', name: 'Wollongong', namePersian: 'ولونگونگ' },
    { id: 'whyalla', name: 'Whyalla', namePersian: 'وایآلا' },
    { id: 'yeppoon', name: 'Yeppoon', namePersian: 'یپون' }
  ],
  finland: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'akaa', name: 'Akaa', namePersian: 'آکا' },
    { id: 'espoo', name: 'Espoo', namePersian: 'اسپو' },
    { id: 'forssa', name: 'Forssa', namePersian: 'فورسا' },
    { id: 'hamina', name: 'Hamina', namePersian: 'هامینا' },
    { id: 'hanko', name: 'Hanko', namePersian: 'هانکو' },
    { id: 'harjavalta', name: 'Harjavalta', namePersian: 'هارياوالتا' },
    { id: 'heinola', name: 'Heinola', namePersian: 'هاینولا' },
    { id: 'helsinki', name: 'Helsinki', namePersian: 'هلسینکی' },
    { id: 'iisalmi', name: 'Iisalmi', namePersian: 'ایسالمی' },
    { id: 'ikaalinen', name: 'Ikaalinen', namePersian: 'ایکالینن' },
    { id: 'imatra', name: 'Imatra', namePersian: 'ایماترا' },
    { id: 'jyväskylä', name: 'Jyväskylä', namePersian: 'یوواسکولا' },
    { id: 'jämsä', name: 'Jämsä', namePersian: 'یامسا' },
    { id: 'järvenpää', name: 'Järvenpää', namePersian: 'یاروِنپا' },
    { id: 'kaarina', name: 'Kaarina', namePersian: 'کارینا' },
    { id: 'kajaani', name: 'Kajaani', namePersian: 'کایانی' },
    { id: 'kangasala', name: 'Kangasala', namePersian: 'کانگاسالا' },
    { id: 'kankaanpää', name: 'Kankaanpää', namePersian: 'کانکانپا' },
    { id: 'kemi', name: 'Kemi', namePersian: 'کمی' },
    { id: 'kemijärvi', name: 'Kemijärvi', namePersian: 'کمی‌یاروی' },
    { id: 'kerava', name: 'Kerava', namePersian: 'کراوا' },
    { id: 'keuruu', name: 'Keuruu', namePersian: 'کائورو' },
    { id: 'kirkkonummi', name: 'Kirkkonummi', namePersian: 'کیرکونومی' },
    { id: 'kokkola', name: 'Kokkola', namePersian: 'کوکولا' },
    { id: 'kotka', name: 'Kotka', namePersian: 'کوتکا' },
    { id: 'kouvola', name: 'Kouvola', namePersian: 'کوولا' },
    { id: 'kuopio', name: 'Kuopio', namePersian: 'کوپیو' },
    { id: 'kurikka', name: 'Kurikka', namePersian: 'کوریکا' },
    { id: 'kuusamo', name: 'Kuusamo', namePersian: 'کوساما' },
    { id: 'lahti', name: 'Lahti', namePersian: 'لاهتی' },
    { id: 'laitila', name: 'Laitila', namePersian: 'لایتیلا' },
    { id: 'lappeenranta', name: 'Lappeenranta', namePersian: 'لاپِن‌رانتا' },
    { id: 'lapua', name: 'Lapua', namePersian: 'لاپوا' },
    { id: 'lieksa', name: 'Lieksa', namePersian: 'لیکسا' },
    { id: 'lohja', name: 'Lohja', namePersian: 'لوهیا' },
    { id: 'loimaa', name: 'Loimaa', namePersian: 'لویما' },
    { id: 'loviisa', name: 'Loviisa', namePersian: 'لوویسا' },
    { id: 'maarianhamina', name: 'Maarianhamina (Mariehamn)', namePersian: 'ماریان‌هامینا (ماریه‌هامن)' },
    { id: 'mikkeli', name: 'Mikkeli', namePersian: 'میکلی' },
    { id: 'mäntsälä', name: 'Mäntsälä', namePersian: 'منتسالا' },
    { id: 'naantali', name: 'Naantali', namePersian: 'نانتالی' },
    { id: 'nivala', name: 'Nivala', namePersian: 'نیوالا' },
    { id: 'nokia', name: 'Nokia', namePersian: 'نوکیا' },
    { id: 'nurmijärvi', name: 'Nurmijärvi', namePersian: 'نورمی‌یاروی' },
    { id: 'oulu', name: 'Oulu', namePersian: 'اولو' },
    { id: 'paimio', name: 'Paimio', namePersian: 'پایمیو' },
    { id: 'pargas', name: 'Pargas (Parainen)', namePersian: 'پارگاس (پارای‌نن)' },
    { id: 'pieksämäki', name: 'Pieksämäki', namePersian: 'پیکسامکی' },
    { id: 'pietarsaari', name: 'Pietarsaari (Jakobstad)', namePersian: 'پیتارساری (یاکوبستاد)' },
    { id: 'pori', name: 'Pori', namePersian: 'پوری' },
    { id: 'porvoo', name: 'Porvoo', namePersian: 'پورو' },
    { id: 'punkalaidun', name: 'Punkalaidun', namePersian: 'پونکالایدون' },
    { id: 'pyhäjärvi', name: 'Pyhäjärvi', namePersian: 'پوها‌یاروی' },
    { id: 'raahe', name: 'Raahe', namePersian: 'راهه' },
    { id: 'raasepori', name: 'Raasepori (Raseborg)', namePersian: 'راسه‌پوری (راسه‌بورگ)' },
    { id: 'raisio', name: 'Raisio', namePersian: 'رایسیو' },
    { id: 'rauma', name: 'Rauma', namePersian: 'راوما' },
    { id: 'riihimäki', name: 'Riihimäki', namePersian: 'ریهی‌مکی' },
    { id: 'rovaniemi', name: 'Rovaniemi', namePersian: 'روانیمی' },
    { id: 'salo', name: 'Salo', namePersian: 'سالو' },
    { id: 'sastamala', name: 'Sastamala', namePersian: 'ساستامالا' },
    { id: 'savonlinna', name: 'Savonlinna', namePersian: 'ساوون‌لینا' },
    { id: 'seinäjoki', name: 'Seinäjoki', namePersian: 'سایناریو‌کی' },
    { id: 'siilinjärvi', name: 'Siilinjärvi', namePersian: 'سیلین‌یاروی' },
    { id: 'sipoo', name: 'Sipoo', namePersian: 'سیپو' },
    { id: 'sysmä', name: 'Sysmä', namePersian: 'سیسما' },
    { id: 'tampere', name: 'Tampere', namePersian: 'تامپره' },
    { id: 'tornio', name: 'Tornio', namePersian: 'تورنیو' },
    { id: 'turku', name: 'Turku', namePersian: 'تورکو' },
    { id: 'ulvila', name: 'Ulvila', namePersian: 'اولویلا' },
    { id: 'uusikaarlepyy', name: 'Uusikaarlepyy (Nykarleby)', namePersian: 'اوسی‌کارله‌پو (نیکارله‌بی)' },
    { id: 'uusikaupunki', name: 'Uusikaupunki', namePersian: 'اوسی‌کائوپونکی' },
    { id: 'vaasa', name: 'Vaasa', namePersian: 'واسا' },
    { id: 'valkeakoski', name: 'Valkeakoski', namePersian: 'والکه‌آکوسکی' },
    { id: 'vantaa', name: 'Vantaa', namePersian: 'وانتا' },
    { id: 'varkaus', name: 'Varkaus', namePersian: 'وارکائوس' },
    { id: 'vihti', name: 'Vihti', namePersian: 'ویهتی' },
    { id: 'virrat', name: 'Virrat', namePersian: 'ویرات' },
    { id: 'ylöjärvi', name: 'Ylöjärvi', namePersian: 'یلو‌یاروی' },
    { id: 'ylivieska', name: 'Ylivieska', namePersian: 'یلی‌ویسکا' },
    { id: 'äänekoski', name: 'Äänekoski', namePersian: 'انه‌کوسکی' }
  ],
  mexico: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'mexico-city', name: 'Mexico City', namePersian: 'مکزیکو سیتی' },
    { id: 'guadalajara', name: 'Guadalajara', namePersian: 'گوادالاخارا' },
    { id: 'monterrey', name: 'Monterrey', namePersian: 'مونتری' },
    { id: 'cancun', name: 'Cancún', namePersian: 'کانکون' },
    { id: 'tijuana', name: 'Tijuana', namePersian: 'تیخوانا' }
  ]
};

export function LocationPickerModal({ isOpen, onClose, onLocationSelect }: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { currentLanguage, t, dir } = useLanguage();

  if (!isOpen) return null;

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedCity(''); // Reset city when country changes
    setShowCountryDropdown(false);
    setCountrySearchQuery(''); // Clear search
    setCitySearchQuery(''); // Clear city search when country changes
    
    // If "all" countries is selected, automatically select "all" cities
    if (countryId === 'all') {
      setSelectedCity('all');
    }
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    setShowCityDropdown(false);
    setCitySearchQuery(''); // Clear search
  };

  const handleApply = () => {
    if (selectedCountry && selectedCity) {
      // Handle "all" selections
      if (selectedCountry === 'all' && selectedCity === 'all') {
        const allCountriesText = currentLanguage === 'en' ? 'All Countries' : 'همه کشورها';
        const allCitiesText = currentLanguage === 'en' ? 'All Cities' : 'همه شهرها';
        onLocationSelect(allCountriesText, allCitiesText);
        onClose();
        return;
      }
      
      // Handle specific country with all cities
      if (selectedCountry !== 'all' && selectedCity === 'all') {
        const country = COUNTRIES.find(c => c.id === selectedCountry);
        if (country) {
          const countryName = currentLanguage === 'en' ? country.name : country.namePersian;
          const allCitiesText = currentLanguage === 'en' ? 'All Cities' : 'همه شهرها';
          onLocationSelect(countryName, allCitiesText);
          onClose();
          return;
        }
      }
      
      // Handle specific country and city
      const country = COUNTRIES.find(c => c.id === selectedCountry);
      const city = CITIES[selectedCountry]?.find(c => c.id === selectedCity);
      
      if (country && city) {
        const countryName = currentLanguage === 'en' ? country.name : country.namePersian;
        const cityName = currentLanguage === 'en' ? city.name : city.namePersian;
        onLocationSelect(countryName, cityName);
        onClose();
      }
    }
  };

  const handleAutoDetect = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, set to London when location is detected
          // In a real app, you'd use reverse geocoding to get the actual location
          setIsDetectingLocation(false);
          onLocationSelect('United Kingdom', 'London');
          onClose();
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
          
          console.error('Geolocation error:', errorMessage);
          toast.error(errorMessage);
          
          // Still fallback to London for demo purposes
          onLocationSelect('United Kingdom', 'London');
          onClose();
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
      console.error(errorMessage);
      toast.error(errorMessage);
      
      // Fallback to London
      onLocationSelect('United Kingdom', 'London');
      onClose();
    }
  };

  const selectedCountryData = COUNTRIES.find(c => c.id === selectedCountry);
  const selectedCityData = selectedCountry ? CITIES[selectedCountry]?.find(c => c.id === selectedCity) : null;
  const availableCities = selectedCountry ? CITIES[selectedCountry] || [] : [];

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
    <div className={`fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col ${dir}`} dir={dir}>
      {/* Header */}
      <div className="bg-[#1a1a1a] flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-white text-lg font-bold">
          {currentLanguage === 'en' ? 'Location' : 'مکان'}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">


        </div>
      </div>

      <div className="flex-1 px-4 py-2 space-y-4">
        {/* Country Selector */}
        <div className="relative">
          <button
            onClick={() => {
              const newState = !showCountryDropdown;
              setShowCountryDropdown(newState);
              if (!newState) setCountrySearchQuery(''); // Clear search when closing
            }}
            className="w-full bg-[#363636] text-white px-4 py-4 rounded-lg text-left flex items-center justify-between h-14"
          >
            <span className={selectedCountryData ? 'text-white' : 'text-[#adadad]'}>
              {selectedCountryData 
                ? (currentLanguage === 'en' ? selectedCountryData.name : selectedCountryData.namePersian)
                : (currentLanguage === 'en' ? 'Country' : 'کشور')
              }
            </span>
            <ChevronDown className="h-4 w-4 text-[#adadad]" />
          </button>

          {showCountryDropdown && (
            <div className="absolute top-16 left-0 right-0 bg-[#363636] rounded-lg shadow-lg z-10 max-h-60">
              {/* Country Search */}
              <div className="p-3 border-b border-[#4a4a4a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#adadad]" />
                  <Input
                    type="text"
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    placeholder={currentLanguage === 'en' ? 'Search countries...' : 'جستجوی کشورها...'}
                    className="bg-[#2a2a2a] border-none text-white pl-10 pr-4 py-2 rounded-lg h-10 placeholder:text-[#adadad]"
                    dir={dir}
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
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#4a4a4a] last:rounded-b-lg"
                    >
                      {currentLanguage === 'en' ? country.name : country.namePersian}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#adadad] text-center">
                    {currentLanguage === 'en' ? 'No countries found' : 'کشوری یافت نشد'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => {
              if (selectedCountry) {
                const newState = !showCityDropdown;
                setShowCityDropdown(newState);
                if (!newState) setCitySearchQuery(''); // Clear search when closing
              }
            }}
            className={`w-full bg-[#363636] text-white px-4 py-4 rounded-lg text-left flex items-center justify-between h-14 ${
              !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!selectedCountry}
          >
            <span className={selectedCityData ? 'text-white' : 'text-[#adadad]'}>
              {selectedCityData 
                ? (currentLanguage === 'en' ? selectedCityData.name : selectedCityData.namePersian)
                : (currentLanguage === 'en' ? 'City' : 'شهر')
              }
            </span>
            <ChevronDown className="h-4 w-4 text-[#adadad]" />
          </button>

          {showCityDropdown && selectedCountry && (
            <div className="absolute top-16 left-0 right-0 bg-[#363636] rounded-lg shadow-lg z-10 max-h-60">
              {/* City Search */}
              <div className="p-3 border-b border-[#4a4a4a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#adadad]" />
                  <Input
                    type="text"
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    placeholder={currentLanguage === 'en' ? 'Search cities...' : 'جستجوی شهرها...'}
                    className="bg-[#2a2a2a] border-none text-white pl-10 pr-4 py-2 rounded-lg h-10 placeholder:text-[#adadad]"
                    dir={dir}
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
                        handleCitySelect(city.id);
                        setCitySearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#4a4a4a] last:rounded-b-lg"
                    >
                      {currentLanguage === 'en' ? city.name : city.namePersian}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#adadad] text-center">
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
          className="w-full bg-[#2a2a2a] text-[#0ac2af] px-4 py-3 rounded-lg text-center border border-[#0ac2af] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDetectingLocation 
            ? (currentLanguage === 'en' ? 'Detecting...' : 'در حال تشخیص...')
            : (currentLanguage === 'en' ? 'Auto-detect my location' : 'تشخیص خودکار مکان من')
          }
        </button>
      </div>

      {/* Apply Button */}
      <div className="p-4">
        <Button
          onClick={handleApply}
          disabled={!selectedCountry || !selectedCity}
          className="w-full bg-[#141414] text-white py-3 rounded-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentLanguage === 'en' ? 'Apply' : 'اع��ال'}
        </Button>
      </div>

      {/* Bottom Spacer */}
      <div className="bg-[#1a1a1a] h-5"></div>
    </div>
  );
}