-- Step 1: Create the ads table
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    title_persian text,
    description text NOT NULL,
    description_persian text,
    price decimal(10,2) DEFAULT 0,
    price_type text DEFAULT 'fixed',
    currency text DEFAULT 'USD',
    category text NOT NULL,
    subcategory text,
    images text[] DEFAULT '{}',
    owner_id text NOT NULL,
    contact_info jsonb DEFAULT '{}',
    location jsonb DEFAULT '{}',
    status text DEFAULT 'pending',
    approved boolean DEFAULT false,
    featured boolean DEFAULT false,
    featured_until timestamptz,
    urgent boolean DEFAULT false,
    condition text,
    brand text,
    model text,
    specifications jsonb,
    payment_status text DEFAULT 'pending',
    payment_id text,
    moderation_result jsonb,
    views integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    expires_at timestamptz
);

-- Step 2: Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id text PRIMARY KEY,
    settings jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Step 3: Create indexes (only after tables exist)
CREATE INDEX IF NOT EXISTS idx_ads_owner_id ON public.ads(owner_id);
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can insert their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can delete their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- Step 6: Create new policies
CREATE POLICY "Anyone can view approved ads" ON public.ads
    FOR SELECT USING (approved = true OR status = 'approved');

CREATE POLICY "Users can manage their own ads" ON public.ads
    FOR ALL USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can manage their own settings" ON public.user_settings
    FOR ALL USING (user_id = auth.uid()::text);

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.ads TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;