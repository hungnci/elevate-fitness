-- Create profiles table (extending Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    instructor VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    schedule_time TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, class_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Classes policies
CREATE POLICY "Classes are viewable by everyone."
  ON public.classes FOR SELECT
  USING ( true );

-- Bookings policies
CREATE POLICY "Users can view their own bookings."
  ON public.bookings FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own bookings."
  ON public.bookings FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own bookings."
  ON public.bookings FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own bookings."
  ON public.bookings FOR DELETE
  USING ( auth.uid() = user_id );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.classes TO anon, authenticated;
GRANT ALL ON public.bookings TO authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Insert dummy data for classes
INSERT INTO public.classes (name, description, instructor, duration_minutes, max_capacity, schedule_time, image_url)
VALUES
('Yoga Flow', 'A relaxing yoga session to improve flexibility and mindfulness.', 'Sarah Jenkins', 60, 15, NOW() + INTERVAL '1 day', 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&auto=format&fit=crop&q=60'),
('HIIT Blast', 'High-intensity interval training to burn calories fast.', 'Mike Tyson', 45, 20, NOW() + INTERVAL '2 days', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60'),
('Pilates Core', 'Strengthen your core with our specialized Pilates class.', 'Emily Blunt', 50, 12, NOW() + INTERVAL '3 days', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=60');

-- Create a trigger to automatically create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
