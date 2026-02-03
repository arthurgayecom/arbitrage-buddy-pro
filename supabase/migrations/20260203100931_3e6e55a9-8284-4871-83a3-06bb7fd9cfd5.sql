-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  phantom_wallet_address TEXT,
  profit_threshold DECIMAL(5,2) DEFAULT 2.00,
  auto_execute BOOLEAN DEFAULT false,
  simulation_mode BOOLEAN DEFAULT true,
  discord_webhook_url TEXT,
  email_alerts BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create arbitrage_opportunities table
CREATE TABLE public.arbitrage_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_name TEXT NOT NULL,
  polymarket_price DECIMAL(10,4),
  kalshi_price DECIMAL(10,4),
  polymarket_url TEXT,
  kalshi_url TEXT,
  profit_percentage DECIMAL(10,4) NOT NULL,
  win_probability DECIMAL(5,2),
  expected_value DECIMAL(10,4),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'executed')),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id) ON DELETE SET NULL,
  market_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('polymarket', 'kalshi')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount DECIMAL(18,8) NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  profit_loss DECIMAL(18,8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  is_simulation BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create user_api_credentials table (encrypted storage)
CREATE TABLE public.user_api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('polymarket', 'kalshi')),
  credential_type TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform, credential_type)
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('opportunity', 'trade_executed', 'trade_failed', 'threshold_met')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Arbitrage opportunities policies (public read for authenticated users)
CREATE POLICY "Authenticated users can view opportunities"
  ON public.arbitrage_opportunities FOR SELECT
  TO authenticated
  USING (true);

-- Trades policies
CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

-- API credentials policies
CREATE POLICY "Users can view own credentials"
  ON public.user_api_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON public.user_api_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON public.user_api_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
  ON public.user_api_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON public.user_api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();