-- The Sound Scraper UI is hosted on static GitHub Pages. Allow anonymous
-- read-only access to its public song metadata and word index so catalog
-- searches can run without the FastAPI server. No write access is granted.
DROP POLICY IF EXISTS "Public can read Sound Scraper catalog" ON public.tracks;
CREATE POLICY "Public can read Sound Scraper catalog"
  ON public.tracks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read Sound Scraper word index" ON public.word_occurrences;
CREATE POLICY "Public can read Sound Scraper word index"
  ON public.word_occurrences FOR SELECT TO anon, authenticated USING (true);
