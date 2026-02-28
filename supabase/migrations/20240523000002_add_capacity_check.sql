-- Function to check capacity before inserting a booking
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    capacity INTEGER;
BEGIN
    -- Get the max capacity for the class
    SELECT max_capacity INTO capacity FROM public.classes WHERE id = NEW.class_id;
    
    -- Get the current number of bookings for this class
    SELECT COUNT(*) INTO current_count FROM public.bookings WHERE class_id = NEW.class_id AND status = 'confirmed';
    
    -- Check if there is space
    IF current_count >= capacity THEN
        RAISE EXCEPTION 'Class is fully booked';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the check before insert
DROP TRIGGER IF EXISTS check_capacity_trigger ON public.bookings;
CREATE TRIGGER check_capacity_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION check_class_capacity();
