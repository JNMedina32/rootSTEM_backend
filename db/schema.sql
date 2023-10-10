DROP TABLE IF EXISTS videos;

CREATE TABLE videos (
  video_id SERIAL PRIMARY KEY,
  video_embed_link TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER CHECK (duration <= 60),
  views INTEGER DEFAULT 0,
  stem_cat TEXT REFERENCES stem_categories(categories),
  question_id INTEGER
);



INSERT INTO videos (video_embed_link, title, description, duration, stem_cat, question_id)
Values
('https://screenrec.com/share/2kvo75wSMB', 'Exponents', 'Quick concept view of exponents', 39, 'Algebra', 1);

-- DROP TABLE IF EXISTS public.users;
CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 214748 CACHE 1 ),
    username text COLLATE pg_catalog."default" NOT NULL,
    first_name text COLLATE pg_catalog."default" NOT NULL,
    last_name text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default",
    date_created date NOT NULL DEFAULT now(),
    img text COLLATE pg_catalog."default",
    access_token text COLLATE pg_catalog."default",
    refresh_token text COLLATE pg_catalog."default",
    google_id text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_google_id_key UNIQUE (google_id)
)


-- Trigger: hash_password_trigger

-- DROP TRIGGER IF EXISTS hash_password_trigger ON public.users;

-- CREATE TRIGGER hash_password_trigger
--     BEFORE INSERT OR UPDATE 
--     ON public.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.hash_password_trigger_function();