-- Sound Scraper has been removed from the public site. Keep its existing
-- database records intact, but revoke the anonymous catalog access that was
-- added for the static frontend.
DROP POLICY IF EXISTS "Public can read Sound Scraper catalog" ON public.tracks;
DROP POLICY IF EXISTS "Public can read Sound Scraper word index" ON public.word_occurrences;
