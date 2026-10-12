-- ACME Retail demo seed as plain SQL. Generated on 2026-10-12 from the same TypeScript dataset
-- that `pnpm seed` uses (src/data/catalog.ts, src/data/categories.ts, src/lib/seed/build-demo.ts).
-- Use it when no service role key is available (Supabase SQL editor, `supabase db reset`, or the MCP).
-- It is safe to run more than once: it deletes the demo rows first, then re-inserts everything.
-- Demo accounts get the password from src/services/access.ts (demoPassword). Product art is served
-- from public/products, so the storage upload that `pnpm seed` does is skipped here.
-- Expected counts: 6 categories, 3 coupons, 40 products, 74 variants, 6 users, 60 orders, 128 items,
-- 60 payments, 31 reservations, 33 shipments, 112 shipment events, 5 returns, 7 refunds, 2 addresses.

delete from public.domain_events;

delete from public.orders;

delete from public.cart_items;

delete from public.carts;

delete from public.wishlists;

delete from public.addresses;

delete from public.products;

delete from public.categories;

delete from public.coupons;

delete from auth.users where email like '%@acme-retail.example';

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', '7dd30198-ed1e-460a-8b43-bd6ae45f0055', 'authenticated', 'authenticated', 'customer@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Avery Chen"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('662cde15-1e7e-4640-80f8-d3ffea0bb973', '7dd30198-ed1e-460a-8b43-bd6ae45f0055', '7dd30198-ed1e-460a-8b43-bd6ae45f0055', '{"sub":"7dd30198-ed1e-460a-8b43-bd6ae45f0055","email":"customer@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('7dd30198-ed1e-460a-8b43-bd6ae45f0055', 'customer@acme-retail.example', 'Avery Chen', 'customer'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', '6946e5fb-37f0-48b2-b01a-62539e95d766', 'authenticated', 'authenticated', 'catalog@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Mina Patel"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('30ed754f-44a5-4f14-a2c5-d96fb2d3333f', '6946e5fb-37f0-48b2-b01a-62539e95d766', '6946e5fb-37f0-48b2-b01a-62539e95d766', '{"sub":"6946e5fb-37f0-48b2-b01a-62539e95d766","email":"catalog@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('6946e5fb-37f0-48b2-b01a-62539e95d766', 'catalog@acme-retail.example', 'Mina Patel', 'catalog'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', '20c4a66f-7513-4c43-844f-d87e0540a4ef', 'authenticated', 'authenticated', 'warehouse@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Luis Ortega"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('b66580f5-028e-41b2-82b6-cd4da71576a0', '20c4a66f-7513-4c43-844f-d87e0540a4ef', '20c4a66f-7513-4c43-844f-d87e0540a4ef', '{"sub":"20c4a66f-7513-4c43-844f-d87e0540a4ef","email":"warehouse@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('20c4a66f-7513-4c43-844f-d87e0540a4ef', 'warehouse@acme-retail.example', 'Luis Ortega', 'warehouse'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', '3cbef6f4-695e-4f19-af03-f0bb08675ac9', 'authenticated', 'authenticated', 'finance@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Nora Blake"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('684830ea-3878-4f20-a949-472ee3043a03', '3cbef6f4-695e-4f19-af03-f0bb08675ac9', '3cbef6f4-695e-4f19-af03-f0bb08675ac9', '{"sub":"3cbef6f4-695e-4f19-af03-f0bb08675ac9","email":"finance@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('3cbef6f4-695e-4f19-af03-f0bb08675ac9', 'finance@acme-retail.example', 'Nora Blake', 'finance'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', 'c5446047-b2c8-4ecb-b7e2-eca547551063', 'authenticated', 'authenticated', 'admin@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sam Okonkwo"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('b56ba31b-66a0-4ff2-b04f-1cea7912e56d', 'c5446047-b2c8-4ecb-b7e2-eca547551063', 'c5446047-b2c8-4ecb-b7e2-eca547551063', '{"sub":"c5446047-b2c8-4ecb-b7e2-eca547551063","email":"admin@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('c5446047-b2c8-4ecb-b7e2-eca547551063', 'admin@acme-retail.example', 'Sam Okonkwo', 'administrator'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', '67090993-c5bd-48d4-90ae-91e35132bbc4', 'authenticated', 'authenticated', 'jordan@acme-retail.example', extensions.crypt('DemoPass123!', extensions.gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Jordan Lee"}'::jsonb, now(), now(), '', '', '', '', '', '', '', '', false, false);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('156f5c5a-dd68-482b-830c-30705d3f0a4e', '67090993-c5bd-48d4-90ae-91e35132bbc4', '67090993-c5bd-48d4-90ae-91e35132bbc4', '{"sub":"67090993-c5bd-48d4-90ae-91e35132bbc4","email":"jordan@acme-retail.example","email_verified":true,"phone_verified":false}'::jsonb, 'email', now(), now(), now());

insert into public.profiles (id, email, full_name, role) values ('67090993-c5bd-48d4-90ae-91e35132bbc4', 'jordan@acme-retail.example', 'Jordan Lee', 'customer'::public.user_role)
on conflict (id) do update set email = excluded.email, full_name = excluded.full_name, role = excluded.role;

insert into public.categories (slug, name, blurb, sort_order) values
('apparel','Apparel','Shirts, layers, and trousers for the week.',0),
('footwear','Footwear','Shoes for the commute, the trail, and the house.',1),
('home','Home','Table, textile, and light for quiet rooms.',2),
('kitchen','Kitchen','Tools that earn a permanent spot on the counter.',3),
('outdoor','Outdoor','Packable pieces for days away from the desk.',4),
('accessories','Accessories','Small goods that finish the outfit.',5);

insert into public.coupons (code, kind, value, min_subtotal_cents, label, active) values
('WELCOME10','percent',10,0,'10% off your first illustrated order',true),
('SAVE15','fixed',1500,8000,'$15 off orders over $80',true),
('FREESHIP','free_shipping',0,0,'Free illustrative standard shipping',true);

insert into public.products (slug, name, description, brand, category_id, status, base_price_cents, compare_at_cents, featured)
select v.slug, v.name, v.description, v.brand, c.id, 'active'::public.product_status, v.price::integer, v.compare::integer, v.featured::boolean
from (values
('meridian-oxford-shirt','Meridian Oxford Shirt','A crisp cotton oxford with a soft collar and a straight hem.','Hale & Co','apparel',7800,null,true),
('harbor-knit-polo','Harbor Knit Polo','A breathable knit polo that holds its shape after a wash.','Hale & Co','apparel',6400,null,false),
('field-chore-jacket','Field Chore Jacket','A canvas chore jacket with four pockets and a corduroy collar.','Northline','apparel',16800,null,true),
('everyday-crew-tee','Everyday Crew Tee','A midweight crew tee in combed cotton, cut a little longer in the back.','Hale & Co','apparel',3200,4000,true),
('soft-flannel-overshirt','Soft Flannel Overshirt','Brushed flannel with pearl buttons and a chest pocket.','Northline','apparel',8800,null,false),
('tailored-wool-trouser','Tailored Wool Trouser','A clean wool trouser with a pressed crease and a comfortable rise.','Atelier West','apparel',14800,null,false),
('relaxed-denim-jean','Relaxed Denim Jean','Rinse denim with a relaxed thigh and a straight leg.','Atelier West','apparel',11800,null,false),
('weekend-chino','Weekend Chino','Garment-dyed cotton chino that softens through the season.','Hale & Co','apparel',9800,null,false),
('ribbed-cotton-socks','Ribbed Cotton Socks','A three-pack of ribbed crew socks in combed cotton.','Hale & Co','apparel',1800,null,false),
('lightweight-rain-shell','Lightweight Rain Shell','A packable shell with taped seams and a quiet hood.','Northline','apparel',13800,null,false),
('court-leather-sneaker','Court Leather Sneaker','Smooth leather court sneaker with a cupsole and a padded tongue.','Mile Marker','footwear',12800,null,true),
('trail-day-hiker','Trail Day Hiker','A light hiker with a grippy outsole for day trails.','Mile Marker','footwear',15800,null,false),
('slip-on-canvas','Slip-on Canvas','Washed canvas slip-on with a cork footbed.','Mile Marker','footwear',6800,null,false),
('city-chelsea-boot','City Chelsea Boot','A polished chelsea boot with elastic gussets and a stacked heel.','Mile Marker','footwear',18800,null,false),
('cushioned-house-slide','Cushioned House Slide','A contoured slide for the house and the porch.','Mile Marker','footwear',3600,null,false),
('stoneware-dinner-plate','Stoneware Dinner Plate','A 10-inch dinner plate with a speckled glaze and a raised rim.','Kiln House','home',2800,null,true),
('linen-throw-blanket','Linen Throw Blanket','Stonewashed linen throw, loosely woven and ready for the sofa.','Kiln House','home',9600,null,false),
('ceramic-table-lamp','Ceramic Table Lamp','A hand-finished ceramic lamp with a linen shade.','Kiln House','home',12400,null,false),
('oak-picture-frame','Oak Picture Frame','Solid oak frame with a clean bevel and a white mat.','Kiln House','home',4200,null,false),
('cotton-percale-sheet-set','Cotton Percale Sheet Set','Crisp percale sheets that feel cool on the first night.','Loom & Field','home',14200,null,false),
('wool-area-rug','Wool Area Rug','A low-pile wool rug in a natural undyed blend.','Loom & Field','home',24000,null,false),
('glass-carafe','Glass Carafe','A one-liter carafe for water on the table.','Kiln House','home',3600,null,false),
('cedar-candle','Cedar Candle','A soy candle poured in a reusable glass.','Hearth Note','home',2600,null,false),
('cast-iron-skillet','Cast Iron Skillet','Pre-seasoned cast iron that moves from stove to oven.','Hearth Note','kitchen',7200,null,true),
('chef-knife','Chef Knife','An 8-inch chef knife with a full tang and a beech handle.','Forge & Board','kitchen',8400,null,false),
('mixing-bowl-set','Mixing Bowl Set','Three nested stoneware bowls with a pouring lip.','Kiln House','kitchen',4800,null,false),
('beech-cutting-board','Beech Cutting Board','Edge-grain beech board with a juice groove.','Forge & Board','kitchen',5400,null,false),
('enamel-kettle','Enamel Kettle','A stovetop kettle with a whistle and a stay-cool handle.','Hearth Note','kitchen',6200,null,false),
('linen-tea-towels','Linen Tea Towels','A set of two linen towels that dry quickly.','Loom & Field','kitchen',2400,null,false),
('pour-over-coffee-maker','Pour-over Coffee Maker','A glass carafe with a reusable steel filter.','Forge & Board','kitchen',4600,null,false),
('packable-daypack','Packable Daypack','A 16-liter pack that folds into its own pocket.','Northline','outdoor',7800,null,true),
('insulated-bottle','Insulated Bottle','A 20-ounce bottle that keeps water cold through the afternoon.','Northline','outdoor',3400,4200,false),
('camping-mug','Camping Mug','An enamel mug with a rolled rim.','Northline','outdoor',1800,null,false),
('compact-picnic-blanket','Compact Picnic Blanket','A water-resistant blanket that rolls into a strap.','Loom & Field','outdoor',4400,null,false),
('weatherproof-tote','Weatherproof Tote','A coated tote for wet markets and sandy cars.','Northline','outdoor',5800,null,false),
('leather-card-wallet','Leather Card Wallet','Vegetable-tanned leather wallet for four cards and folded notes.','Atelier West','accessories',4800,null,true),
('canvas-market-tote','Canvas Market Tote','Heavy canvas tote with long handles and a flat base.','Hale & Co','accessories',2800,null,false),
('wool-beanie','Wool Beanie','A ribbed merino beanie that packs flat.','Northline','accessories',3200,null,false),
('classic-sunglasses','Classic Sunglasses','Acetate frames with polarized lenses.','Mile Marker','accessories',5800,null,false),
('brass-key-fob','Brass Key Fob','A solid brass fob that takes a patina.','Atelier West','accessories',2200,null,false)) as v(slug, name, description, brand, category, price, compare, featured)
left join public.categories c on c.slug = v.category;

insert into public.product_images (product_id, public_path, alt, sort_order)
select p.id, '/products/' || p.slug || '.svg', p.name, 0 from public.products p;

insert into public.product_variants (product_id, sku, name, options, price_cents, active)
select p.id, v.sku, v.name, v.options::jsonb, v.price::integer, true
from (values
('meridian-oxford-shirt','ACME-MERIDIAN-NAVY-S','Navy / S','{"color":"Navy","size":"S"}',7800),
('meridian-oxford-shirt','ACME-MERIDIAN-NAVY-M','Navy / M','{"color":"Navy","size":"M"}',7800),
('meridian-oxford-shirt','ACME-MERIDIAN-WHITE-M','White / M','{"color":"White","size":"M"}',7800),
('meridian-oxford-shirt','ACME-MERIDIAN-WHITE-L','White / L','{"color":"White","size":"L"}',7800),
('harbor-knit-polo','ACME-HARBOR-K-SAGE-M','Sage / M','{"color":"Sage","size":"M"}',6400),
('harbor-knit-polo','ACME-HARBOR-K-SAGE-L','Sage / L','{"color":"Sage","size":"L"}',6400),
('harbor-knit-polo','ACME-HARBOR-K-INK-M','Ink / M','{"color":"Ink","size":"M"}',6400),
('field-chore-jacket','ACME-FIELD-CH-OLIVE-M','Olive / M','{"color":"Olive","size":"M"}',16800),
('field-chore-jacket','ACME-FIELD-CH-OLIVE-L','Olive / L','{"color":"Olive","size":"L"}',16800),
('everyday-crew-tee','ACME-EVERYDAY-WHITE-M','White / M','{"color":"White","size":"M"}',3200),
('everyday-crew-tee','ACME-EVERYDAY-WHITE-L','White / L','{"color":"White","size":"L"}',3200),
('everyday-crew-tee','ACME-EVERYDAY-BLACK-M','Black / M','{"color":"Black","size":"M"}',3200),
('soft-flannel-overshirt','ACME-SOFT-FLA-RUST-M','Rust / M','{"color":"Rust","size":"M"}',8800),
('soft-flannel-overshirt','ACME-SOFT-FLA-FOREST-M','Forest / M','{"color":"Forest","size":"M"}',8800),
('tailored-wool-trouser','ACME-TAILORED-CHARCOAL-32','Charcoal / 32','{"color":"Charcoal","size":"32"}',14800),
('tailored-wool-trouser','ACME-TAILORED-CHARCOAL-34','Charcoal / 34','{"color":"Charcoal","size":"34"}',14800),
('relaxed-denim-jean','ACME-RELAXED--INDIGO-30','Indigo / 30','{"color":"Indigo","size":"30"}',11800),
('relaxed-denim-jean','ACME-RELAXED--INDIGO-32','Indigo / 32','{"color":"Indigo","size":"32"}',11800),
('relaxed-denim-jean','ACME-RELAXED--INDIGO-34','Indigo / 34','{"color":"Indigo","size":"34"}',11800),
('weekend-chino','ACME-WEEKEND--STONE-32','Stone / 32','{"color":"Stone","size":"32"}',9800),
('weekend-chino','ACME-WEEKEND--STONE-34','Stone / 34','{"color":"Stone","size":"34"}',9800),
('ribbed-cotton-socks','ACME-RIBBED-C-OAT-PACK','Oat pack','{"color":"Oat"}',1800),
('ribbed-cotton-socks','ACME-RIBBED-C-NAVY-PACK','Navy pack','{"color":"Navy"}',1800),
('lightweight-rain-shell','ACME-LIGHTWEI-SLATE-M','Slate / M','{"color":"Slate","size":"M"}',13800),
('lightweight-rain-shell','ACME-LIGHTWEI-SLATE-L','Slate / L','{"color":"Slate","size":"L"}',13800),
('court-leather-sneaker','ACME-COURT-LE-WHITE-8','White / 8','{"color":"White","size":"8"}',12800),
('court-leather-sneaker','ACME-COURT-LE-WHITE-9','White / 9','{"color":"White","size":"9"}',12800),
('court-leather-sneaker','ACME-COURT-LE-WHITE-10','White / 10','{"color":"White","size":"10"}',12800),
('trail-day-hiker','ACME-TRAIL-DA-EARTH-8','Earth / 8','{"color":"Earth","size":"8"}',15800),
('trail-day-hiker','ACME-TRAIL-DA-EARTH-9','Earth / 9','{"color":"Earth","size":"9"}',15800),
('trail-day-hiker','ACME-TRAIL-DA-EARTH-10','Earth / 10','{"color":"Earth","size":"10"}',15800),
('slip-on-canvas','ACME-SLIP-ON--BLACK-8','Black / 8','{"color":"Black","size":"8"}',6800),
('slip-on-canvas','ACME-SLIP-ON--BLACK-9','Black / 9','{"color":"Black","size":"9"}',6800),
('city-chelsea-boot','ACME-CITY-CHE-BLACK-9','Black / 9','{"color":"Black","size":"9"}',18800),
('city-chelsea-boot','ACME-CITY-CHE-BLACK-10','Black / 10','{"color":"Black","size":"10"}',18800),
('cushioned-house-slide','ACME-CUSHIONE-SAND-8','Sand / 8','{"color":"Sand","size":"8"}',3600),
('cushioned-house-slide','ACME-CUSHIONE-SAND-9','Sand / 9','{"color":"Sand","size":"9"}',3600),
('stoneware-dinner-plate','ACME-STONEWAR-SPECKLE','Speckle','{"color":"Speckle"}',2800),
('stoneware-dinner-plate','ACME-STONEWAR-WHITE','White','{"color":"White"}',2800),
('linen-throw-blanket','ACME-LINEN-TH-OAT','Oat','{"color":"Oat"}',9600),
('linen-throw-blanket','ACME-LINEN-TH-SEA','Sea','{"color":"Sea"}',9600),
('ceramic-table-lamp','ACME-CERAMIC--BONE','Bone','{"color":"Bone"}',12400),
('oak-picture-frame','ACME-OAK-PICT-5-X-7','5 x 7','{"size":"5x7"}',4200),
('oak-picture-frame','ACME-OAK-PICT-8-X-10','8 x 10','{"size":"8x10"}',4200),
('cotton-percale-sheet-set','ACME-COTTON-P-QUEEN-WHITE','Queen / White','{"size":"Queen","color":"White"}',14200),
('cotton-percale-sheet-set','ACME-COTTON-P-QUEEN-SAGE','Queen / Sage','{"size":"Queen","color":"Sage"}',14200),
('wool-area-rug','ACME-WOOL-ARE-5-X-8-NATURAL','5 x 8 Natural','{"size":"5x8","color":"Natural"}',24000),
('glass-carafe','ACME-GLASS-CA-CLEAR','Clear','{"color":"Clear"}',3600),
('cedar-candle','ACME-CEDAR-CA-CEDAR','Cedar','{"scent":"Cedar"}',2600),
('cedar-candle','ACME-CEDAR-CA-FIG','Fig','{"scent":"Fig"}',2600),
('cast-iron-skillet','ACME-CAST-IRO-10-INCH','10 inch','{"size":"10 inch"}',7200),
('cast-iron-skillet','ACME-CAST-IRO-12-INCH','12 inch','{"size":"12 inch"}',7200),
('chef-knife','ACME-CHEF-KNI-8-INCH','8 inch','{"size":"8 inch"}',8400),
('mixing-bowl-set','ACME-MIXING-B-SPECKLE','Speckle','{"color":"Speckle"}',4800),
('beech-cutting-board','ACME-BEECH-CU-MEDIUM','Medium','{"size":"Medium"}',5400),
('beech-cutting-board','ACME-BEECH-CU-LARGE','Large','{"size":"Large"}',5400),
('enamel-kettle','ACME-ENAMEL-K-CREAM','Cream','{"color":"Cream"}',6200),
('linen-tea-towels','ACME-LINEN-TE-STRIPE','Stripe','{"pattern":"Stripe"}',2400),
('pour-over-coffee-maker','ACME-POUR-OVE-GLASS','Glass','{"material":"Glass"}',4600),
('packable-daypack','ACME-PACKABLE-SPRUCE','Spruce','{"color":"Spruce"}',7800),
('packable-daypack','ACME-PACKABLE-SAND','Sand','{"color":"Sand"}',7800),
('insulated-bottle','ACME-INSULATE-STONE','Stone','{"color":"Stone","size":"20oz"}',3400),
('insulated-bottle','ACME-INSULATE-GREEN','Green','{"color":"Green","size":"20oz"}',3400),
('camping-mug','ACME-CAMPING--WHITE','White','{"color":"White"}',1800),
('compact-picnic-blanket','ACME-COMPACT--GINGHAM','Gingham','{"pattern":"Gingham"}',4400),
('weatherproof-tote','ACME-WEATHERP-BLACK','Black','{"color":"Black"}',5800),
('leather-card-wallet','ACME-LEATHER--TAN','Tan','{"color":"Tan"}',4800),
('leather-card-wallet','ACME-LEATHER--BLACK','Black','{"color":"Black"}',4800),
('canvas-market-tote','ACME-CANVAS-M-NATURAL','Natural','{"color":"Natural"}',2800),
('canvas-market-tote','ACME-CANVAS-M-NAVY','Navy','{"color":"Navy"}',2800),
('wool-beanie','ACME-WOOL-BEA-CHARCOAL','Charcoal','{"color":"Charcoal"}',3200),
('wool-beanie','ACME-WOOL-BEA-CAMEL','Camel','{"color":"Camel"}',3200),
('classic-sunglasses','ACME-CLASSIC--TORTOISE','Tortoise','{"color":"Tortoise"}',5800),
('brass-key-fob','ACME-BRASS-KE-BRASS','Brass','{"material":"Brass"}',2200)) as v(slug, sku, name, options, price)
join public.products p on p.slug = v.slug;
insert into public.inventory (variant_id, on_hand, reserved, location, reorder_point)
select pv.id, v.on_hand::integer, v.reserved::integer, v.location, 4
from (values
('ACME-MERIDIAN-NAVY-S',12,0,'A-12'),
('ACME-MERIDIAN-NAVY-M',18,0,'A-12'),
('ACME-MERIDIAN-WHITE-M',12,0,'A-12'),
('ACME-MERIDIAN-WHITE-L',8,1,'A-12'),
('ACME-HARBOR-K-SAGE-M',11,0,'A-12'),
('ACME-HARBOR-K-SAGE-L',6,0,'A-12'),
('ACME-HARBOR-K-INK-M',8,0,'A-12'),
('ACME-FIELD-CH-OLIVE-M',6,1,'A-12'),
('ACME-FIELD-CH-OLIVE-L',4,1,'A-12'),
('ACME-EVERYDAY-WHITE-M',21,1,'A-12'),
('ACME-EVERYDAY-WHITE-L',15,1,'A-12'),
('ACME-EVERYDAY-BLACK-M',13,1,'A-12'),
('ACME-SOFT-FLA-RUST-M',7,0,'A-12'),
('ACME-SOFT-FLA-FOREST-M',9,0,'A-12'),
('ACME-TAILORED-CHARCOAL-32',6,1,'A-12'),
('ACME-TAILORED-CHARCOAL-34',4,0,'A-12'),
('ACME-RELAXED--INDIGO-30',7,2,'A-12'),
('ACME-RELAXED--INDIGO-32',11,1,'A-12'),
('ACME-RELAXED--INDIGO-34',8,1,'A-12'),
('ACME-WEEKEND--STONE-32',9,0,'A-12'),
('ACME-WEEKEND--STONE-34',10,1,'A-12'),
('ACME-RIBBED-C-OAT-PACK',30,0,'A-12'),
('ACME-RIBBED-C-NAVY-PACK',24,0,'A-12'),
('ACME-LIGHTWEI-SLATE-M',5,0,'A-12'),
('ACME-LIGHTWEI-SLATE-L',4,0,'A-12'),
('ACME-COURT-LE-WHITE-8',7,1,'A-12'),
('ACME-COURT-LE-WHITE-9',8,0,'A-12'),
('ACME-COURT-LE-WHITE-10',4,0,'A-12'),
('ACME-TRAIL-DA-EARTH-8',1,0,'A-12'),
('ACME-TRAIL-DA-EARTH-9',5,0,'A-12'),
('ACME-TRAIL-DA-EARTH-10',2,1,'A-12'),
('ACME-SLIP-ON--BLACK-8',7,0,'A-12'),
('ACME-SLIP-ON--BLACK-9',10,1,'A-12'),
('ACME-CITY-CHE-BLACK-9',3,0,'A-12'),
('ACME-CITY-CHE-BLACK-10',0,0,'A-12'),
('ACME-CUSHIONE-SAND-8',13,1,'A-12'),
('ACME-CUSHIONE-SAND-9',12,0,'A-12'),
('ACME-STONEWAR-SPECKLE',16,0,'B-04'),
('ACME-STONEWAR-WHITE',16,0,'B-04'),
('ACME-LINEN-TH-OAT',3,0,'B-04'),
('ACME-LINEN-TH-SEA',6,0,'B-04'),
('ACME-CERAMIC--BONE',2,0,'B-04'),
('ACME-OAK-PICT-5-X-7',12,0,'B-04'),
('ACME-OAK-PICT-8-X-10',9,0,'B-04'),
('ACME-COTTON-P-QUEEN-WHITE',6,0,'B-04'),
('ACME-COTTON-P-QUEEN-SAGE',4,0,'B-04'),
('ACME-WOOL-ARE-5-X-8-NATURAL',2,1,'B-04'),
('ACME-GLASS-CA-CLEAR',2,1,'B-04'),
('ACME-CEDAR-CA-CEDAR',17,1,'B-04'),
('ACME-CEDAR-CA-FIG',3,1,'B-04'),
('ACME-CAST-IRO-10-INCH',10,1,'B-04'),
('ACME-CAST-IRO-12-INCH',8,0,'B-04'),
('ACME-CHEF-KNI-8-INCH',9,2,'B-04'),
('ACME-MIXING-B-SPECKLE',9,2,'B-04'),
('ACME-BEECH-CU-MEDIUM',7,0,'B-04'),
('ACME-BEECH-CU-LARGE',6,1,'B-04'),
('ACME-ENAMEL-K-CREAM',7,1,'B-04'),
('ACME-LINEN-TE-STRIPE',17,0,'B-04'),
('ACME-POUR-OVE-GLASS',13,1,'B-04'),
('ACME-PACKABLE-SPRUCE',9,1,'B-04'),
('ACME-PACKABLE-SAND',8,0,'B-04'),
('ACME-INSULATE-STONE',14,0,'B-04'),
('ACME-INSULATE-GREEN',12,0,'B-04'),
('ACME-CAMPING--WHITE',19,0,'B-04'),
('ACME-COMPACT--GINGHAM',7,0,'B-04'),
('ACME-WEATHERP-BLACK',8,0,'B-04'),
('ACME-LEATHER--TAN',8,0,'B-04'),
('ACME-LEATHER--BLACK',7,0,'B-04'),
('ACME-CANVAS-M-NATURAL',16,0,'B-04'),
('ACME-CANVAS-M-NAVY',14,1,'B-04'),
('ACME-WOOL-BEA-CHARCOAL',11,0,'B-04'),
('ACME-WOOL-BEA-CAMEL',8,0,'B-04'),
('ACME-CLASSIC--TORTOISE',6,0,'B-04'),
('ACME-BRASS-KE-BRASS',19,1,'B-04')) as v(sku, on_hand, reserved, location)
join public.product_variants pv on pv.sku = v.sku;

insert into public.orders (number, user_id, email, payment_status, fulfillment_status, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents, coupon_code, shipping_method, shipping_address, billing_address, placed_at)
select v.number, p.id, v.email, v.ps::public.payment_status, v.fs::public.fulfillment_status, v.sub::integer, v.disc::integer, v.ship::integer, v.tax::integer, v.total::integer, v.coupon, v.method, v.addr::jsonb, v.addr::jsonb, v.placed::timestamptz
from (values
('AC10001','customer@acme-retail.example','partially_refunded','delivered',12400,1240,1895,921,13976,'WELCOME10','express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-04T15:00:00.000Z'),
('AC10002','customer@acme-retail.example','partially_refunded','delivered',17200,0,0,1419,18619,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-05T14:00:00.000Z'),
('AC10003','customer@acme-retail.example','partially_refunded','delivered',11200,0,0,924,12124,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-06T13:00:00.000Z'),
('AC10004','customer@acme-retail.example','approved','delivered',3200,0,895,264,4359,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-07T12:00:00.000Z'),
('AC10005','customer@acme-retail.example','approved','delivered',19600,0,1895,1617,23112,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-08T11:00:00.000Z'),
('AC10006','customer@acme-retail.example','approved','delivered',11600,1160,0,861,11301,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-09T10:00:00.000Z'),
('AC10007','customer@acme-retail.example','approved','delivered',23400,0,0,1931,25331,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-10T09:00:00.000Z'),
('AC10008','customer@acme-retail.example','approved','delivered',34800,0,0,2871,37671,'FREESHIP','standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-11T08:00:00.000Z'),
('AC10009','customer@acme-retail.example','approved','delivered',51600,0,1895,4257,57752,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-12T07:00:00.000Z'),
('AC10010','customer@acme-retail.example','approved','delivered',16200,0,0,1337,17537,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-13T06:00:00.000Z'),
('AC10011','customer@acme-retail.example','approved','delivered',17400,1740,0,1292,16952,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-14T05:00:00.000Z'),
('AC10012','customer@acme-retail.example','approved','delivered',34200,0,0,2822,37022,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-15T04:00:00.000Z'),
('AC10013','customer@acme-retail.example','approved','delivered',13800,0,1895,1139,16834,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-16T03:00:00.000Z'),
('AC10014','customer@acme-retail.example','approved','delivered',23600,0,0,1947,25547,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-17T02:00:00.000Z'),
('AC10015','customer@acme-retail.example','approved','delivered',12800,0,0,1056,13856,'FREESHIP','standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-18T01:00:00.000Z'),
('AC10016','customer@acme-retail.example','approved','delivered',12400,1240,0,921,12081,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-19T00:00:00.000Z'),
('AC10017','customer@acme-retail.example','approved','delivered',19400,0,1895,1601,22896,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-19T23:00:00.000Z'),
('AC10018','customer@acme-retail.example','approved','delivered',21600,0,0,1782,23382,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-20T22:00:00.000Z'),
('AC10019','customer@acme-retail.example','approved','shipped',30800,0,0,2541,33341,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-21T21:00:00.000Z'),
('AC10020','customer@acme-retail.example','approved','shipped',22600,0,0,1865,24465,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-22T20:00:00.000Z'),
('AC10021','customer@acme-retail.example','approved','shipped',7800,780,1895,579,9494,'WELCOME10','express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-23T19:00:00.000Z'),
('AC10022','customer@acme-retail.example','approved','shipped',27000,0,0,2228,29228,'FREESHIP','standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-24T18:00:00.000Z'),
('AC10023','customer@acme-retail.example','approved','shipped',18400,0,0,1518,19918,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-25T17:00:00.000Z'),
('AC10024','customer@acme-retail.example','approved','shipped',15000,0,0,1238,16238,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-26T16:00:00.000Z'),
('AC10025','customer@acme-retail.example','approved','shipped',24400,0,1895,2013,28308,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-27T15:00:00.000Z'),
('AC10026','customer@acme-retail.example','approved','shipped',25400,2540,0,1886,24746,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-08-28T14:00:00.000Z'),
('AC10027','customer@acme-retail.example','approved','shipped',39200,0,0,3234,42434,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-08-29T13:00:00.000Z'),
('AC10028','customer@acme-retail.example','approved','shipped',30600,0,0,2525,33125,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-08-30T12:00:00.000Z'),
('AC10029','customer@acme-retail.example','approved','picking',4600,0,1895,380,6875,'FREESHIP','express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-08-31T11:00:00.000Z'),
('AC10030','customer@acme-retail.example','approved','picking',26800,0,0,2211,29011,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-01T10:00:00.000Z'),
('AC10031','customer@acme-retail.example','approved','picking',20200,2020,0,1500,19680,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-02T09:00:00.000Z'),
('AC10032','customer@acme-retail.example','approved','picking',21600,0,0,1782,23382,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-03T08:00:00.000Z'),
('AC10033','customer@acme-retail.example','approved','picking',20000,0,1895,1650,23545,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-04T07:00:00.000Z'),
('AC10034','customer@acme-retail.example','approved','picking',6200,0,895,512,7607,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-05T06:00:00.000Z'),
('AC10035','customer@acme-retail.example','approved','reserved',3200,0,895,264,4359,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-06T05:00:00.000Z'),
('AC10036','customer@acme-retail.example','approved','reserved',28400,2840,0,2109,27669,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-07T04:00:00.000Z'),
('AC10037','customer@acme-retail.example','approved','reserved',12800,0,1895,1056,15751,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-08T03:00:00.000Z'),
('AC10038','customer@acme-retail.example','approved','reserved',2600,0,895,215,3710,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-09T02:00:00.000Z'),
('AC10039','customer@acme-retail.example','pending','reserved',11400,0,0,941,12341,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-10T01:00:00.000Z'),
('AC10040','customer@acme-retail.example','pending','reserved',11600,0,0,957,12557,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-11T00:00:00.000Z'),
('AC10041','customer@acme-retail.example','pending','reserved',14800,1480,1895,1099,16314,'WELCOME10','express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-11T23:00:00.000Z'),
('AC10042','customer@acme-retail.example','pending','reserved',24000,0,0,1980,25980,null,'standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-12T22:00:00.000Z'),
('AC10043','customer@acme-retail.example','requires_authentication','reserved',18200,0,0,1502,19702,'FREESHIP','standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-13T21:00:00.000Z'),
('AC10044','customer@acme-retail.example','requires_authentication','reserved',16800,0,0,1386,18186,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-14T20:00:00.000Z'),
('AC10045','customer@acme-retail.example','requires_authentication','reserved',14000,0,1895,1155,17050,null,'express','{"fullName":"Avery Chen","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-15T19:00:00.000Z'),
('AC10046','customer@acme-retail.example','declined','unfulfilled',3200,320,895,238,4013,'WELCOME10','standard','{"fullName":"Avery Chen","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-16T18:00:00.000Z'),
('AC10047','customer@acme-retail.example','declined','unfulfilled',22400,0,0,1848,24248,null,'standard','{"fullName":"Avery Chen","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-17T17:00:00.000Z'),
('AC10048','customer@acme-retail.example','declined','unfulfilled',3600,0,895,297,4792,null,'standard','{"fullName":"Avery Chen","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-18T16:00:00.000Z'),
('AC10049','jordan@acme-retail.example','declined','unfulfilled',2800,0,1895,231,4926,null,'express','{"fullName":"Jordan Lee","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-19T15:00:00.000Z'),
('AC10050','jordan@acme-retail.example','timed_out','unfulfilled',19200,0,0,1584,20784,'FREESHIP','standard','{"fullName":"Jordan Lee","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-20T14:00:00.000Z'),
('AC10051','jordan@acme-retail.example','timed_out','unfulfilled',18000,1800,0,1337,17537,'WELCOME10','standard','{"fullName":"Jordan Lee","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-21T13:00:00.000Z'),
('AC10052','jordan@acme-retail.example','timed_out','unfulfilled',16800,0,0,1386,18186,null,'standard','{"fullName":"Jordan Lee","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-22T12:00:00.000Z'),
('AC10053','jordan@acme-retail.example','refunded','cancelled',35400,0,1895,2921,40216,null,'express','{"fullName":"Jordan Lee","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-23T11:00:00.000Z'),
('AC10054','jordan@acme-retail.example','declined','cancelled',22000,0,0,1815,23815,null,'standard','{"fullName":"Jordan Lee","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-24T10:00:00.000Z'),
('AC10055','jordan@acme-retail.example','refunded','cancelled',17600,0,0,1452,19052,null,'standard','{"fullName":"Jordan Lee","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-25T09:00:00.000Z'),
('AC10056','jordan@acme-retail.example','approved','return_requested',31800,3180,0,2361,30981,'WELCOME10','standard','{"fullName":"Jordan Lee","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-26T08:00:00.000Z'),
('AC10057','jordan@acme-retail.example','approved','return_requested',15600,0,1895,1287,18782,'FREESHIP','express','{"fullName":"Jordan Lee","line1":"18 Cedar Lane","line2":"Apt 2","city":"Portland","region":"OR","postalCode":"97205","country":"United States"}','2026-09-27T07:00:00.000Z'),
('AC10058','jordan@acme-retail.example','approved','return_requested',14200,0,0,1172,15372,null,'standard','{"fullName":"Jordan Lee","line1":"402 Market Street","line2":"","city":"Austin","region":"TX","postalCode":"78702","country":"United States"}','2026-09-28T06:00:00.000Z'),
('AC10059','jordan@acme-retail.example','refunded','returned',15200,0,0,1254,16454,null,'standard','{"fullName":"Jordan Lee","line1":"77 Willow Court","line2":"Apt 2","city":"Madison","region":"WI","postalCode":"53703","country":"United States"}','2026-09-29T05:00:00.000Z'),
('AC10060','jordan@acme-retail.example','refunded','returned',4800,0,895,396,6091,null,'standard','{"fullName":"Jordan Lee","line1":"9 Harbor Road","line2":"","city":"Burlington","region":"VT","postalCode":"05401","country":"United States"}','2026-09-30T04:00:00.000Z')) as v(number, email, ps, fs, sub, disc, ship, tax, total, coupon, method, addr, placed)
join public.profiles p on p.email = v.email;
insert into public.order_items (order_id, variant_id, sku, name, variant_name, options, quantity, unit_price_cents, line_total_cents)
select o.id, pv.id, v.sku, v.name, v.vname, '{}'::jsonb, v.qty::integer, v.unit::integer, v.unit::integer * v.qty::integer
from (values
('AC10001','ACME-WEEKEND--STONE-32','Weekend Chino','Stone / 32',1,9800),
('AC10001','ACME-CEDAR-CA-CEDAR','Cedar Candle','Cedar',1,2600),
('AC10002','ACME-CERAMIC--BONE','Ceramic Table Lamp','Bone',1,12400),
('AC10002','ACME-MIXING-B-SPECKLE','Mixing Bowl Set','Speckle',1,4800),
('AC10003','ACME-COMPACT--GINGHAM','Compact Picnic Blanket','Gingham',1,4400),
('AC10003','ACME-SLIP-ON--BLACK-8','Slip-on Canvas','Black / 8',1,6800),
('AC10004','ACME-EVERYDAY-BLACK-M','Everyday Crew Tee','Black / M',1,3200),
('AC10005','ACME-LEATHER--TAN','Leather Card Wallet','Tan',1,4800),
('AC10005','ACME-TAILORED-CHARCOAL-34','Tailored Wool Trouser','Charcoal / 34',1,14800),
('AC10006','ACME-CLASSIC--TORTOISE','Classic Sunglasses','Tortoise',1,5800),
('AC10006','ACME-WEATHERP-BLACK','Weatherproof Tote','Black',1,5800),
('AC10007','ACME-TRAIL-DA-EARTH-9','Trail Day Hiker','Earth / 9',1,15800),
('AC10007','ACME-MIXING-B-SPECKLE','Mixing Bowl Set','Speckle',1,4800),
('AC10007','ACME-STONEWAR-WHITE','Stoneware Dinner Plate','White',1,2800),
('AC10008','ACME-COURT-LE-WHITE-8','Court Leather Sneaker','White / 8',1,12800),
('AC10008','ACME-LINEN-TH-OAT','Linen Throw Blanket','Oat',1,9600),
('AC10008','ACME-CERAMIC--BONE','Ceramic Table Lamp','Bone',1,12400),
('AC10009','ACME-RELAXED--INDIGO-30','Relaxed Denim Jean','Indigo / 30',1,11800),
('AC10009','ACME-WOOL-ARE-5-X-8-NATURAL','Wool Area Rug','5 x 8 Natural',1,24000),
('AC10009','ACME-TRAIL-DA-EARTH-8','Trail Day Hiker','Earth / 8',1,15800),
('AC10010','ACME-CAMPING--WHITE','Camping Mug','White',1,1800),
('AC10010','ACME-LEATHER--BLACK','Leather Card Wallet','Black',1,4800),
('AC10010','ACME-LINEN-TH-OAT','Linen Throw Blanket','Oat',1,9600),
('AC10011','ACME-TAILORED-CHARCOAL-34','Tailored Wool Trouser','Charcoal / 34',1,14800),
('AC10011','ACME-CEDAR-CA-CEDAR','Cedar Candle','Cedar',1,2600),
('AC10012','ACME-LIGHTWEI-SLATE-M','Lightweight Rain Shell','Slate / M',1,13800),
('AC10012','ACME-CUSHIONE-SAND-8','Cushioned House Slide','Sand / 8',1,3600),
('AC10012','ACME-FIELD-CH-OLIVE-L','Field Chore Jacket','Olive / L',1,16800),
('AC10013','ACME-LIGHTWEI-SLATE-L','Lightweight Rain Shell','Slate / L',1,13800),
('AC10014','ACME-MERIDIAN-WHITE-M','Meridian Oxford Shirt','White / M',1,7800),
('AC10014','ACME-TRAIL-DA-EARTH-8','Trail Day Hiker','Earth / 8',1,15800),
('AC10015','ACME-COURT-LE-WHITE-10','Court Leather Sneaker','White / 10',1,12800),
('AC10016','ACME-CERAMIC--BONE','Ceramic Table Lamp','Bone',1,12400),
('AC10017','ACME-COURT-LE-WHITE-10','Court Leather Sneaker','White / 10',1,12800),
('AC10017','ACME-INSULATE-STONE','Insulated Bottle','Stone',1,3400),
('AC10017','ACME-WOOL-BEA-CAMEL','Wool Beanie','Camel',1,3200),
('AC10018','ACME-EVERYDAY-WHITE-M','Everyday Crew Tee','White / M',1,3200),
('AC10018','ACME-TRAIL-DA-EARTH-8','Trail Day Hiker','Earth / 8',1,15800),
('AC10018','ACME-CEDAR-CA-CEDAR','Cedar Candle','Cedar',1,2600),
('AC10019','ACME-HARBOR-K-INK-M','Harbor Knit Polo','Ink / M',1,6400),
('AC10019','ACME-TAILORED-CHARCOAL-34','Tailored Wool Trouser','Charcoal / 34',1,14800),
('AC10019','ACME-LINEN-TH-OAT','Linen Throw Blanket','Oat',1,9600),
('AC10020','ACME-TRAIL-DA-EARTH-8','Trail Day Hiker','Earth / 8',1,15800),
('AC10020','ACME-SLIP-ON--BLACK-8','Slip-on Canvas','Black / 8',1,6800),
('AC10021','ACME-MERIDIAN-WHITE-L','Meridian Oxford Shirt','White / L',1,7800),
('AC10022','ACME-COTTON-P-QUEEN-SAGE','Cotton Percale Sheet Set','Queen / Sage',1,14200),
('AC10022','ACME-COURT-LE-WHITE-10','Court Leather Sneaker','White / 10',1,12800),
('AC10023','ACME-HARBOR-K-SAGE-L','Harbor Knit Polo','Sage / L',1,6400),
('AC10023','ACME-EVERYDAY-BLACK-M','Everyday Crew Tee','Black / M',1,3200),
('AC10023','ACME-SOFT-FLA-RUST-M','Soft Flannel Overshirt','Rust / M',1,8800),
('AC10024','ACME-SLIP-ON--BLACK-9','Slip-on Canvas','Black / 9',1,6800),
('AC10024','ACME-WEATHERP-BLACK','Weatherproof Tote','Black',1,5800),
('AC10024','ACME-LINEN-TE-STRIPE','Linen Tea Towels','Stripe',1,2400),
('AC10025','ACME-WOOL-BEA-CAMEL','Wool Beanie','Camel',1,3200),
('AC10025','ACME-TRAIL-DA-EARTH-10','Trail Day Hiker','Earth / 10',1,15800),
('AC10025','ACME-BEECH-CU-MEDIUM','Beech Cutting Board','Medium',1,5400),
('AC10026','ACME-WOOL-BEA-CHARCOAL','Wool Beanie','Charcoal',1,3200),
('AC10026','ACME-HARBOR-K-INK-M','Harbor Knit Polo','Ink / M',1,6400),
('AC10026','ACME-TRAIL-DA-EARTH-10','Trail Day Hiker','Earth / 10',1,15800),
('AC10027','ACME-FIELD-CH-OLIVE-M','Field Chore Jacket','Olive / M',1,16800),
('AC10027','ACME-LINEN-TH-OAT','Linen Throw Blanket','Oat',1,9600),
('AC10027','ACME-COURT-LE-WHITE-9','Court Leather Sneaker','White / 9',1,12800),
('AC10028','ACME-CITY-CHE-BLACK-9','City Chelsea Boot','Black / 9',1,18800),
('AC10028','ACME-RELAXED--INDIGO-32','Relaxed Denim Jean','Indigo / 32',1,11800),
('AC10029','ACME-POUR-OVE-GLASS','Pour-over Coffee Maker','Glass',1,4600),
('AC10030','ACME-WOOL-ARE-5-X-8-NATURAL','Wool Area Rug','5 x 8 Natural',1,24000),
('AC10030','ACME-CANVAS-M-NAVY','Canvas Market Tote','Navy',1,2800),
('AC10031','ACME-RELAXED--INDIGO-30','Relaxed Denim Jean','Indigo / 30',1,11800),
('AC10031','ACME-CHEF-KNI-8-INCH','Chef Knife','8 inch',1,8400),
('AC10032','ACME-RELAXED--INDIGO-30','Relaxed Denim Jean','Indigo / 30',1,11800),
('AC10032','ACME-WEEKEND--STONE-34','Weekend Chino','Stone / 34',1,9800),
('AC10033','ACME-BEECH-CU-LARGE','Beech Cutting Board','Large',1,5400),
('AC10033','ACME-ENAMEL-K-CREAM','Enamel Kettle','Cream',1,6200),
('AC10033','ACME-CHEF-KNI-8-INCH','Chef Knife','8 inch',1,8400),
('AC10034','ACME-CUSHIONE-SAND-8','Cushioned House Slide','Sand / 8',1,3600),
('AC10034','ACME-CEDAR-CA-CEDAR','Cedar Candle','Cedar',1,2600),
('AC10035','ACME-EVERYDAY-BLACK-M','Everyday Crew Tee','Black / M',1,3200),
('AC10036','ACME-MERIDIAN-WHITE-L','Meridian Oxford Shirt','White / L',1,7800),
('AC10036','ACME-TRAIL-DA-EARTH-10','Trail Day Hiker','Earth / 10',1,15800),
('AC10036','ACME-MIXING-B-SPECKLE','Mixing Bowl Set','Speckle',1,4800),
('AC10037','ACME-COURT-LE-WHITE-8','Court Leather Sneaker','White / 8',1,12800),
('AC10038','ACME-CEDAR-CA-FIG','Cedar Candle','Fig',1,2600),
('AC10039','ACME-GLASS-CA-CLEAR','Glass Carafe','Clear',1,3600),
('AC10039','ACME-PACKABLE-SPRUCE','Packable Daypack','Spruce',1,7800),
('AC10040','ACME-MIXING-B-SPECKLE','Mixing Bowl Set','Speckle',1,4800),
('AC10040','ACME-SLIP-ON--BLACK-9','Slip-on Canvas','Black / 9',1,6800),
('AC10041','ACME-TAILORED-CHARCOAL-32','Tailored Wool Trouser','Charcoal / 32',1,14800),
('AC10042','ACME-CAST-IRO-10-INCH','Cast Iron Skillet','10 inch',1,7200),
('AC10042','ACME-FIELD-CH-OLIVE-L','Field Chore Jacket','Olive / L',1,16800),
('AC10043','ACME-RELAXED--INDIGO-32','Relaxed Denim Jean','Indigo / 32',1,11800),
('AC10043','ACME-EVERYDAY-WHITE-L','Everyday Crew Tee','White / L',1,3200),
('AC10043','ACME-EVERYDAY-WHITE-M','Everyday Crew Tee','White / M',1,3200),
('AC10044','ACME-FIELD-CH-OLIVE-M','Field Chore Jacket','Olive / M',1,16800),
('AC10045','ACME-BRASS-KE-BRASS','Brass Key Fob','Brass',1,2200),
('AC10045','ACME-RELAXED--INDIGO-34','Relaxed Denim Jean','Indigo / 34',1,11800),
('AC10046','ACME-EVERYDAY-WHITE-M','Everyday Crew Tee','White / M',1,3200),
('AC10047','ACME-FIELD-CH-OLIVE-L','Field Chore Jacket','Olive / L',1,16800),
('AC10047','ACME-STONEWAR-SPECKLE','Stoneware Dinner Plate','Speckle',1,2800),
('AC10047','ACME-CANVAS-M-NATURAL','Canvas Market Tote','Natural',1,2800),
('AC10048','ACME-GLASS-CA-CLEAR','Glass Carafe','Clear',1,3600),
('AC10049','ACME-CANVAS-M-NATURAL','Canvas Market Tote','Natural',1,2800),
('AC10050','ACME-POUR-OVE-GLASS','Pour-over Coffee Maker','Glass',1,4600),
('AC10050','ACME-COURT-LE-WHITE-8','Court Leather Sneaker','White / 8',1,12800),
('AC10050','ACME-RIBBED-C-NAVY-PACK','Ribbed Cotton Socks','Navy pack',1,1800),
('AC10051','ACME-EVERYDAY-WHITE-M','Everyday Crew Tee','White / M',1,3200),
('AC10051','ACME-TAILORED-CHARCOAL-32','Tailored Wool Trouser','Charcoal / 32',1,14800),
('AC10052','ACME-SOFT-FLA-RUST-M','Soft Flannel Overshirt','Rust / M',1,8800),
('AC10052','ACME-LEATHER--TAN','Leather Card Wallet','Tan',1,4800),
('AC10052','ACME-EVERYDAY-BLACK-M','Everyday Crew Tee','Black / M',1,3200),
('AC10053','ACME-HARBOR-K-INK-M','Harbor Knit Polo','Ink / M',1,6400),
('AC10053','ACME-TAILORED-CHARCOAL-32','Tailored Wool Trouser','Charcoal / 32',1,14800),
('AC10053','ACME-COTTON-P-QUEEN-WHITE','Cotton Percale Sheet Set','Queen / White',1,14200),
('AC10054','ACME-BEECH-CU-LARGE','Beech Cutting Board','Large',1,5400),
('AC10054','ACME-CAMPING--WHITE','Camping Mug','White',1,1800),
('AC10054','ACME-TAILORED-CHARCOAL-34','Tailored Wool Trouser','Charcoal / 34',1,14800),
('AC10055','ACME-TAILORED-CHARCOAL-34','Tailored Wool Trouser','Charcoal / 34',1,14800),
('AC10055','ACME-CANVAS-M-NATURAL','Canvas Market Tote','Natural',1,2800),
('AC10056','ACME-RELAXED--INDIGO-34','Relaxed Denim Jean','Indigo / 34',1,11800),
('AC10056','ACME-FIELD-CH-OLIVE-L','Field Chore Jacket','Olive / L',1,16800),
('AC10056','ACME-EVERYDAY-WHITE-L','Everyday Crew Tee','White / L',1,3200),
('AC10057','ACME-COURT-LE-WHITE-9','Court Leather Sneaker','White / 9',1,12800),
('AC10057','ACME-STONEWAR-WHITE','Stoneware Dinner Plate','White',1,2800),
('AC10058','ACME-MERIDIAN-WHITE-M','Meridian Oxford Shirt','White / M',1,7800),
('AC10058','ACME-HARBOR-K-SAGE-L','Harbor Knit Polo','Sage / L',1,6400),
('AC10059','ACME-POUR-OVE-GLASS','Pour-over Coffee Maker','Glass',1,4600),
('AC10059','ACME-OAK-PICT-8-X-10','Oak Picture Frame','8 x 10',1,4200),
('AC10059','ACME-HARBOR-K-SAGE-L','Harbor Knit Polo','Sage / L',1,6400),
('AC10060','ACME-LEATHER--TAN','Leather Card Wallet','Tan',1,4800)) as v(number, sku, name, vname, qty, unit)
join public.orders o on o.number = v.number
left join public.product_variants pv on pv.sku = v.sku;

insert into public.payments (order_id, provider, status, amount_cents, scenario, message, created_at)
select o.id, 'simulated'::public.payment_provider, v.status::public.payment_status, v.amount::integer, v.scenario, v.message, v.created::timestamptz
from (values
('AC10001','partially_refunded',13976,'approved','Simulated payment approved. The price was saved with the order.','2026-08-04T15:00:00.000Z'),
('AC10002','partially_refunded',18619,'approved','Simulated payment approved. The price was saved with the order.','2026-08-05T14:00:00.000Z'),
('AC10003','partially_refunded',12124,'approved','Simulated payment approved. The price was saved with the order.','2026-08-06T13:00:00.000Z'),
('AC10004','approved',4359,'approved','Simulated payment approved. The price was saved with the order.','2026-08-07T12:00:00.000Z'),
('AC10005','approved',23112,'approved','Simulated payment approved. The price was saved with the order.','2026-08-08T11:00:00.000Z'),
('AC10006','approved',11301,'approved','Simulated payment approved. The price was saved with the order.','2026-08-09T10:00:00.000Z'),
('AC10007','approved',25331,'approved','Simulated payment approved. The price was saved with the order.','2026-08-10T09:00:00.000Z'),
('AC10008','approved',37671,'approved','Simulated payment approved. The price was saved with the order.','2026-08-11T08:00:00.000Z'),
('AC10009','approved',57752,'approved','Simulated payment approved. The price was saved with the order.','2026-08-12T07:00:00.000Z'),
('AC10010','approved',17537,'approved','Simulated payment approved. The price was saved with the order.','2026-08-13T06:00:00.000Z'),
('AC10011','approved',16952,'approved','Simulated payment approved. The price was saved with the order.','2026-08-14T05:00:00.000Z'),
('AC10012','approved',37022,'approved','Simulated payment approved. The price was saved with the order.','2026-08-15T04:00:00.000Z'),
('AC10013','approved',16834,'approved','Simulated payment approved. The price was saved with the order.','2026-08-16T03:00:00.000Z'),
('AC10014','approved',25547,'approved','Simulated payment approved. The price was saved with the order.','2026-08-17T02:00:00.000Z'),
('AC10015','approved',13856,'approved','Simulated payment approved. The price was saved with the order.','2026-08-18T01:00:00.000Z'),
('AC10016','approved',12081,'approved','Simulated payment approved. The price was saved with the order.','2026-08-19T00:00:00.000Z'),
('AC10017','approved',22896,'approved','Simulated payment approved. The price was saved with the order.','2026-08-19T23:00:00.000Z'),
('AC10018','approved',23382,'approved','Simulated payment approved. The price was saved with the order.','2026-08-20T22:00:00.000Z'),
('AC10019','approved',33341,'approved','Simulated payment approved.','2026-08-21T21:00:00.000Z'),
('AC10020','approved',24465,'approved','Simulated payment approved.','2026-08-22T20:00:00.000Z'),
('AC10021','approved',9494,'approved','Simulated payment approved.','2026-08-23T19:00:00.000Z'),
('AC10022','approved',29228,'approved','Simulated payment approved.','2026-08-24T18:00:00.000Z'),
('AC10023','approved',19918,'approved','Simulated payment approved.','2026-08-25T17:00:00.000Z'),
('AC10024','approved',16238,'approved','Simulated payment approved.','2026-08-26T16:00:00.000Z'),
('AC10025','approved',28308,'approved','Simulated payment approved.','2026-08-27T15:00:00.000Z'),
('AC10026','approved',24746,'approved','Simulated payment approved.','2026-08-28T14:00:00.000Z'),
('AC10027','approved',42434,'approved','Simulated payment approved.','2026-08-29T13:00:00.000Z'),
('AC10028','approved',33125,'approved','Simulated payment approved.','2026-08-30T12:00:00.000Z'),
('AC10029','approved',6875,'approved','Simulated payment approved. Waiting in the warehouse.','2026-08-31T11:00:00.000Z'),
('AC10030','approved',29011,'approved','Simulated payment approved. Waiting in the warehouse.','2026-09-01T10:00:00.000Z'),
('AC10031','approved',19680,'approved','Simulated payment approved. Waiting in the warehouse.','2026-09-02T09:00:00.000Z'),
('AC10032','approved',23382,'approved','Simulated payment approved. Waiting in the warehouse.','2026-09-03T08:00:00.000Z'),
('AC10033','approved',23545,'approved','Simulated payment approved. Waiting in the warehouse.','2026-09-04T07:00:00.000Z'),
('AC10034','approved',7607,'approved','Simulated payment approved. Waiting in the warehouse.','2026-09-05T06:00:00.000Z'),
('AC10035','approved',4359,'approved','Simulated payment approved. Stock is reserved.','2026-09-06T05:00:00.000Z'),
('AC10036','approved',27669,'approved','Simulated payment approved. Stock is reserved.','2026-09-07T04:00:00.000Z'),
('AC10037','approved',15751,'approved','Simulated payment approved. Stock is reserved.','2026-09-08T03:00:00.000Z'),
('AC10038','approved',3710,'approved','Simulated payment approved. Stock is reserved.','2026-09-09T02:00:00.000Z'),
('AC10039','pending',12341,null,'Payment is still pending. Stock is held for a short time.','2026-09-10T01:00:00.000Z'),
('AC10040','pending',12557,null,'Payment is still pending. Stock is held for a short time.','2026-09-11T00:00:00.000Z'),
('AC10041','pending',16314,null,'Payment is still pending. Stock is held for a short time.','2026-09-11T23:00:00.000Z'),
('AC10042','pending',25980,null,'Payment is still pending. Stock is held for a short time.','2026-09-12T22:00:00.000Z'),
('AC10043','requires_authentication',19702,'authentication_required','The simulated bank asked for an extra authentication step.','2026-09-13T21:00:00.000Z'),
('AC10044','requires_authentication',18186,'authentication_required','The simulated bank asked for an extra authentication step.','2026-09-14T20:00:00.000Z'),
('AC10045','requires_authentication',17050,'authentication_required','The simulated bank asked for an extra authentication step.','2026-09-15T19:00:00.000Z'),
('AC10046','declined',4013,'declined','The simulated card was declined. No charge was made.','2026-09-16T18:00:00.000Z'),
('AC10047','declined',24248,'declined','The simulated card was declined. No charge was made.','2026-09-17T17:00:00.000Z'),
('AC10048','declined',4792,'declined','The simulated card was declined. No charge was made.','2026-09-18T16:00:00.000Z'),
('AC10049','declined',4926,'declined','The simulated card was declined. No charge was made.','2026-09-19T15:00:00.000Z'),
('AC10050','timed_out',20784,'timeout','The simulated gateway timed out. No charge was made.','2026-09-20T14:00:00.000Z'),
('AC10051','timed_out',17537,'timeout','The simulated gateway timed out. No charge was made.','2026-09-21T13:00:00.000Z'),
('AC10052','timed_out',18186,'timeout','The simulated gateway timed out. No charge was made.','2026-09-22T12:00:00.000Z'),
('AC10053','refunded',40216,'approved','Order cancelled and fully refunded in the simulation.','2026-09-23T11:00:00.000Z'),
('AC10054','declined',23815,'declined','Order cancelled before payment completed.','2026-09-24T10:00:00.000Z'),
('AC10055','refunded',19052,'approved','Order cancelled and fully refunded in the simulation.','2026-09-25T09:00:00.000Z'),
('AC10056','approved',30981,'approved','Simulated payment approved.','2026-09-26T08:00:00.000Z'),
('AC10057','approved',18782,'approved','Simulated payment approved.','2026-09-27T07:00:00.000Z'),
('AC10058','approved',15372,'approved','Simulated payment approved.','2026-09-28T06:00:00.000Z'),
('AC10059','refunded',16454,'approved','Return received and fully refunded in the simulation.','2026-09-29T05:00:00.000Z'),
('AC10060','refunded',6091,'approved','Return received and fully refunded in the simulation.','2026-09-30T04:00:00.000Z')) as v(number, status, amount, scenario, message, created)
join public.orders o on o.number = v.number;

insert into public.stock_reservations (order_id, variant_id, quantity, purpose, expires_at)
select o.id, pv.id, v.qty::integer, case when v.approved::boolean then 'fulfillment'::public.reservation_purpose else 'checkout'::public.reservation_purpose end, case when v.approved::boolean then null else now() + interval '20 minutes' end
from (values
('AC10029','ACME-POUR-OVE-GLASS',1,true),
('AC10030','ACME-WOOL-ARE-5-X-8-NATURAL',1,true),
('AC10030','ACME-CANVAS-M-NAVY',1,true),
('AC10031','ACME-RELAXED--INDIGO-30',1,true),
('AC10031','ACME-CHEF-KNI-8-INCH',1,true),
('AC10032','ACME-RELAXED--INDIGO-30',1,true),
('AC10032','ACME-WEEKEND--STONE-34',1,true),
('AC10033','ACME-BEECH-CU-LARGE',1,true),
('AC10033','ACME-ENAMEL-K-CREAM',1,true),
('AC10033','ACME-CHEF-KNI-8-INCH',1,true),
('AC10034','ACME-CUSHIONE-SAND-8',1,true),
('AC10034','ACME-CEDAR-CA-CEDAR',1,true),
('AC10035','ACME-EVERYDAY-BLACK-M',1,true),
('AC10036','ACME-MERIDIAN-WHITE-L',1,true),
('AC10036','ACME-TRAIL-DA-EARTH-10',1,true),
('AC10036','ACME-MIXING-B-SPECKLE',1,true),
('AC10037','ACME-COURT-LE-WHITE-8',1,true),
('AC10038','ACME-CEDAR-CA-FIG',1,true),
('AC10039','ACME-GLASS-CA-CLEAR',1,false),
('AC10039','ACME-PACKABLE-SPRUCE',1,false),
('AC10040','ACME-MIXING-B-SPECKLE',1,false),
('AC10040','ACME-SLIP-ON--BLACK-9',1,false),
('AC10041','ACME-TAILORED-CHARCOAL-32',1,false),
('AC10042','ACME-CAST-IRO-10-INCH',1,false),
('AC10042','ACME-FIELD-CH-OLIVE-L',1,false),
('AC10043','ACME-RELAXED--INDIGO-32',1,false),
('AC10043','ACME-EVERYDAY-WHITE-L',1,false),
('AC10043','ACME-EVERYDAY-WHITE-M',1,false),
('AC10044','ACME-FIELD-CH-OLIVE-M',1,false),
('AC10045','ACME-BRASS-KE-BRASS',1,false),
('AC10045','ACME-RELAXED--INDIGO-34',1,false)) as v(number, sku, qty, approved)
join public.orders o on o.number = v.number
join public.product_variants pv on pv.sku = v.sku;

insert into public.shipments (order_id, carrier, tracking_number, status, shipped_at, delivered_at)
select o.id, v.carrier, v.tracking, v.status::public.shipment_status, v.shipped::timestamptz, v.delivered::timestamptz
from (values
('AC10001','Northline Parcel','ACME100000','delivered','2026-08-04T15:00:00.000Z','2026-08-04T15:00:00.000Z'),
('AC10002','Harbor Post','ACME100001','delivered','2026-08-05T14:00:00.000Z','2026-08-05T14:00:00.000Z'),
('AC10003','Northline Parcel','ACME100002','delivered','2026-08-06T13:00:00.000Z','2026-08-06T13:00:00.000Z'),
('AC10004','Harbor Post','ACME100003','delivered','2026-08-07T12:00:00.000Z','2026-08-07T12:00:00.000Z'),
('AC10005','Northline Parcel','ACME100004','delivered','2026-08-08T11:00:00.000Z','2026-08-08T11:00:00.000Z'),
('AC10006','Harbor Post','ACME100005','delivered','2026-08-09T10:00:00.000Z','2026-08-09T10:00:00.000Z'),
('AC10007','Northline Parcel','ACME100006','delivered','2026-08-10T09:00:00.000Z','2026-08-10T09:00:00.000Z'),
('AC10008','Harbor Post','ACME100007','delivered','2026-08-11T08:00:00.000Z','2026-08-11T08:00:00.000Z'),
('AC10009','Northline Parcel','ACME100008','delivered','2026-08-12T07:00:00.000Z','2026-08-12T07:00:00.000Z'),
('AC10010','Harbor Post','ACME100009','delivered','2026-08-13T06:00:00.000Z','2026-08-13T06:00:00.000Z'),
('AC10011','Northline Parcel','ACME100010','delivered','2026-08-14T05:00:00.000Z','2026-08-14T05:00:00.000Z'),
('AC10012','Harbor Post','ACME100011','delivered','2026-08-15T04:00:00.000Z','2026-08-15T04:00:00.000Z'),
('AC10013','Northline Parcel','ACME100012','delivered','2026-08-16T03:00:00.000Z','2026-08-16T03:00:00.000Z'),
('AC10014','Harbor Post','ACME100013','delivered','2026-08-17T02:00:00.000Z','2026-08-17T02:00:00.000Z'),
('AC10015','Northline Parcel','ACME100014','delivered','2026-08-18T01:00:00.000Z','2026-08-18T01:00:00.000Z'),
('AC10016','Harbor Post','ACME100015','delivered','2026-08-19T00:00:00.000Z','2026-08-19T00:00:00.000Z'),
('AC10017','Northline Parcel','ACME100016','delivered','2026-08-19T23:00:00.000Z','2026-08-19T23:00:00.000Z'),
('AC10018','Harbor Post','ACME100017','delivered','2026-08-20T22:00:00.000Z','2026-08-20T22:00:00.000Z'),
('AC10019','Northline Parcel','ACME100018','in_transit','2026-08-21T21:00:00.000Z',null),
('AC10020','Harbor Post','ACME100019','in_transit','2026-08-22T20:00:00.000Z',null),
('AC10021','Northline Parcel','ACME100020','in_transit','2026-08-23T19:00:00.000Z',null),
('AC10022','Harbor Post','ACME100021','in_transit','2026-08-24T18:00:00.000Z',null),
('AC10023','Northline Parcel','ACME100022','in_transit','2026-08-25T17:00:00.000Z',null),
('AC10024','Harbor Post','ACME100023','in_transit','2026-08-26T16:00:00.000Z',null),
('AC10025','Northline Parcel','ACME100024','in_transit','2026-08-27T15:00:00.000Z',null),
('AC10026','Harbor Post','ACME100025','in_transit','2026-08-28T14:00:00.000Z',null),
('AC10027','Northline Parcel','ACME100026','in_transit','2026-08-29T13:00:00.000Z',null),
('AC10028','Harbor Post','ACME100027','in_transit','2026-08-30T12:00:00.000Z',null),
('AC10056','Harbor Post','ACME100055','delivered','2026-09-26T08:00:00.000Z','2026-09-26T08:00:00.000Z'),
('AC10057','Northline Parcel','ACME100056','delivered','2026-09-27T07:00:00.000Z','2026-09-27T07:00:00.000Z'),
('AC10058','Harbor Post','ACME100057','delivered','2026-09-28T06:00:00.000Z','2026-09-28T06:00:00.000Z'),
('AC10059','Northline Parcel','ACME100058','delivered','2026-09-29T05:00:00.000Z','2026-09-29T05:00:00.000Z'),
('AC10060','Harbor Post','ACME100059','delivered','2026-09-30T04:00:00.000Z','2026-09-30T04:00:00.000Z')) as v(number, carrier, tracking, status, shipped, delivered)
join public.orders o on o.number = v.number;
insert into public.shipment_events (shipment_id, status, message, occurred_at)
select s.id, v.status::public.shipment_status, v.message, v.occurred::timestamptz
from (values
('ACME100000','label_created','Shipping label created.','2026-08-04T21:00:00.000Z'),
('ACME100000','in_transit','Parcel accepted by the carrier.','2026-08-05T11:00:00.000Z'),
('ACME100000','out_for_delivery','Out for delivery.','2026-08-06T13:00:00.000Z'),
('ACME100000','delivered','Delivered. Signed for at the door.','2026-08-06T19:00:00.000Z'),
('ACME100001','label_created','Shipping label created.','2026-08-05T20:00:00.000Z'),
('ACME100001','in_transit','Parcel accepted by the carrier.','2026-08-06T10:00:00.000Z'),
('ACME100001','out_for_delivery','Out for delivery.','2026-08-07T12:00:00.000Z'),
('ACME100001','delivered','Delivered. Signed for at the door.','2026-08-07T18:00:00.000Z'),
('ACME100002','label_created','Shipping label created.','2026-08-06T19:00:00.000Z'),
('ACME100002','in_transit','Parcel accepted by the carrier.','2026-08-07T09:00:00.000Z'),
('ACME100002','out_for_delivery','Out for delivery.','2026-08-08T11:00:00.000Z'),
('ACME100002','delivered','Delivered. Signed for at the door.','2026-08-08T17:00:00.000Z'),
('ACME100003','label_created','Shipping label created.','2026-08-07T18:00:00.000Z'),
('ACME100003','in_transit','Parcel accepted by the carrier.','2026-08-08T08:00:00.000Z'),
('ACME100003','out_for_delivery','Out for delivery.','2026-08-09T10:00:00.000Z'),
('ACME100003','delivered','Delivered. Signed for at the door.','2026-08-09T16:00:00.000Z'),
('ACME100004','label_created','Shipping label created.','2026-08-08T17:00:00.000Z'),
('ACME100004','in_transit','Parcel accepted by the carrier.','2026-08-09T07:00:00.000Z'),
('ACME100004','out_for_delivery','Out for delivery.','2026-08-10T09:00:00.000Z'),
('ACME100004','delivered','Delivered. Signed for at the door.','2026-08-10T15:00:00.000Z'),
('ACME100005','label_created','Shipping label created.','2026-08-09T16:00:00.000Z'),
('ACME100005','in_transit','Parcel accepted by the carrier.','2026-08-10T06:00:00.000Z'),
('ACME100005','out_for_delivery','Out for delivery.','2026-08-11T08:00:00.000Z'),
('ACME100005','delivered','Delivered. Signed for at the door.','2026-08-11T14:00:00.000Z'),
('ACME100006','label_created','Shipping label created.','2026-08-10T15:00:00.000Z'),
('ACME100006','in_transit','Parcel accepted by the carrier.','2026-08-11T05:00:00.000Z'),
('ACME100006','out_for_delivery','Out for delivery.','2026-08-12T07:00:00.000Z'),
('ACME100006','delivered','Delivered. Signed for at the door.','2026-08-12T13:00:00.000Z'),
('ACME100007','label_created','Shipping label created.','2026-08-11T14:00:00.000Z'),
('ACME100007','in_transit','Parcel accepted by the carrier.','2026-08-12T04:00:00.000Z'),
('ACME100007','out_for_delivery','Out for delivery.','2026-08-13T06:00:00.000Z'),
('ACME100007','delivered','Delivered. Signed for at the door.','2026-08-13T12:00:00.000Z'),
('ACME100008','label_created','Shipping label created.','2026-08-12T13:00:00.000Z'),
('ACME100008','in_transit','Parcel accepted by the carrier.','2026-08-13T03:00:00.000Z'),
('ACME100008','out_for_delivery','Out for delivery.','2026-08-14T05:00:00.000Z'),
('ACME100008','delivered','Delivered. Signed for at the door.','2026-08-14T11:00:00.000Z'),
('ACME100009','label_created','Shipping label created.','2026-08-13T12:00:00.000Z'),
('ACME100009','in_transit','Parcel accepted by the carrier.','2026-08-14T02:00:00.000Z'),
('ACME100009','out_for_delivery','Out for delivery.','2026-08-15T04:00:00.000Z'),
('ACME100009','delivered','Delivered. Signed for at the door.','2026-08-15T10:00:00.000Z'),
('ACME100010','label_created','Shipping label created.','2026-08-14T11:00:00.000Z'),
('ACME100010','in_transit','Parcel accepted by the carrier.','2026-08-15T01:00:00.000Z'),
('ACME100010','out_for_delivery','Out for delivery.','2026-08-16T03:00:00.000Z'),
('ACME100010','delivered','Delivered. Signed for at the door.','2026-08-16T09:00:00.000Z'),
('ACME100011','label_created','Shipping label created.','2026-08-15T10:00:00.000Z'),
('ACME100011','in_transit','Parcel accepted by the carrier.','2026-08-16T00:00:00.000Z'),
('ACME100011','out_for_delivery','Out for delivery.','2026-08-17T02:00:00.000Z'),
('ACME100011','delivered','Delivered. Signed for at the door.','2026-08-17T08:00:00.000Z'),
('ACME100012','label_created','Shipping label created.','2026-08-16T09:00:00.000Z'),
('ACME100012','in_transit','Parcel accepted by the carrier.','2026-08-16T23:00:00.000Z'),
('ACME100012','out_for_delivery','Out for delivery.','2026-08-18T01:00:00.000Z'),
('ACME100012','delivered','Delivered. Signed for at the door.','2026-08-18T07:00:00.000Z'),
('ACME100013','label_created','Shipping label created.','2026-08-17T08:00:00.000Z'),
('ACME100013','in_transit','Parcel accepted by the carrier.','2026-08-17T22:00:00.000Z'),
('ACME100013','out_for_delivery','Out for delivery.','2026-08-19T00:00:00.000Z'),
('ACME100013','delivered','Delivered. Signed for at the door.','2026-08-19T06:00:00.000Z'),
('ACME100014','label_created','Shipping label created.','2026-08-18T07:00:00.000Z'),
('ACME100014','in_transit','Parcel accepted by the carrier.','2026-08-18T21:00:00.000Z'),
('ACME100014','out_for_delivery','Out for delivery.','2026-08-19T23:00:00.000Z'),
('ACME100014','delivered','Delivered. Signed for at the door.','2026-08-20T05:00:00.000Z'),
('ACME100015','label_created','Shipping label created.','2026-08-19T06:00:00.000Z'),
('ACME100015','in_transit','Parcel accepted by the carrier.','2026-08-19T20:00:00.000Z'),
('ACME100015','out_for_delivery','Out for delivery.','2026-08-20T22:00:00.000Z'),
('ACME100015','delivered','Delivered. Signed for at the door.','2026-08-21T04:00:00.000Z'),
('ACME100016','label_created','Shipping label created.','2026-08-20T05:00:00.000Z'),
('ACME100016','in_transit','Parcel accepted by the carrier.','2026-08-20T19:00:00.000Z'),
('ACME100016','out_for_delivery','Out for delivery.','2026-08-21T21:00:00.000Z'),
('ACME100016','delivered','Delivered. Signed for at the door.','2026-08-22T03:00:00.000Z'),
('ACME100017','label_created','Shipping label created.','2026-08-21T04:00:00.000Z'),
('ACME100017','in_transit','Parcel accepted by the carrier.','2026-08-21T18:00:00.000Z'),
('ACME100017','out_for_delivery','Out for delivery.','2026-08-22T20:00:00.000Z'),
('ACME100017','delivered','Delivered. Signed for at the door.','2026-08-23T02:00:00.000Z'),
('ACME100018','label_created','Shipping label created.','2026-08-22T03:00:00.000Z'),
('ACME100018','in_transit','Parcel accepted by the carrier.','2026-08-22T17:00:00.000Z'),
('ACME100019','label_created','Shipping label created.','2026-08-23T02:00:00.000Z'),
('ACME100019','in_transit','Parcel accepted by the carrier.','2026-08-23T16:00:00.000Z'),
('ACME100020','label_created','Shipping label created.','2026-08-24T01:00:00.000Z'),
('ACME100020','in_transit','Parcel accepted by the carrier.','2026-08-24T15:00:00.000Z'),
('ACME100021','label_created','Shipping label created.','2026-08-25T00:00:00.000Z'),
('ACME100021','in_transit','Parcel accepted by the carrier.','2026-08-25T14:00:00.000Z'),
('ACME100022','label_created','Shipping label created.','2026-08-25T23:00:00.000Z'),
('ACME100022','in_transit','Parcel accepted by the carrier.','2026-08-26T13:00:00.000Z'),
('ACME100023','label_created','Shipping label created.','2026-08-26T22:00:00.000Z'),
('ACME100023','in_transit','Parcel accepted by the carrier.','2026-08-27T12:00:00.000Z'),
('ACME100024','label_created','Shipping label created.','2026-08-27T21:00:00.000Z'),
('ACME100024','in_transit','Parcel accepted by the carrier.','2026-08-28T11:00:00.000Z'),
('ACME100025','label_created','Shipping label created.','2026-08-28T20:00:00.000Z'),
('ACME100025','in_transit','Parcel accepted by the carrier.','2026-08-29T10:00:00.000Z'),
('ACME100026','label_created','Shipping label created.','2026-08-29T19:00:00.000Z'),
('ACME100026','in_transit','Parcel accepted by the carrier.','2026-08-30T09:00:00.000Z'),
('ACME100027','label_created','Shipping label created.','2026-08-30T18:00:00.000Z'),
('ACME100027','in_transit','Parcel accepted by the carrier.','2026-08-31T08:00:00.000Z'),
('ACME100055','label_created','Shipping label created.','2026-09-26T14:00:00.000Z'),
('ACME100055','in_transit','Parcel accepted by the carrier.','2026-09-27T04:00:00.000Z'),
('ACME100055','out_for_delivery','Out for delivery.','2026-09-28T06:00:00.000Z'),
('ACME100055','delivered','Delivered. Signed for at the door.','2026-09-28T12:00:00.000Z'),
('ACME100056','label_created','Shipping label created.','2026-09-27T13:00:00.000Z'),
('ACME100056','in_transit','Parcel accepted by the carrier.','2026-09-28T03:00:00.000Z'),
('ACME100056','out_for_delivery','Out for delivery.','2026-09-29T05:00:00.000Z'),
('ACME100056','delivered','Delivered. Signed for at the door.','2026-09-29T11:00:00.000Z'),
('ACME100057','label_created','Shipping label created.','2026-09-28T12:00:00.000Z'),
('ACME100057','in_transit','Parcel accepted by the carrier.','2026-09-29T02:00:00.000Z'),
('ACME100057','out_for_delivery','Out for delivery.','2026-09-30T04:00:00.000Z'),
('ACME100057','delivered','Delivered. Signed for at the door.','2026-09-30T10:00:00.000Z'),
('ACME100058','label_created','Shipping label created.','2026-09-29T11:00:00.000Z'),
('ACME100058','in_transit','Parcel accepted by the carrier.','2026-09-30T01:00:00.000Z'),
('ACME100058','out_for_delivery','Out for delivery.','2026-10-01T03:00:00.000Z'),
('ACME100058','delivered','Delivered. Signed for at the door.','2026-10-01T09:00:00.000Z'),
('ACME100059','label_created','Shipping label created.','2026-09-30T10:00:00.000Z'),
('ACME100059','in_transit','Parcel accepted by the carrier.','2026-10-01T00:00:00.000Z'),
('ACME100059','out_for_delivery','Out for delivery.','2026-10-02T02:00:00.000Z'),
('ACME100059','delivered','Delivered. Signed for at the door.','2026-10-02T08:00:00.000Z')) as v(tracking, status, message, occurred)
join public.shipments s on s.tracking_number = v.tracking;

insert into public.returns (id, order_id, user_id, status, reason, created_at)
select v.id::uuid, o.id, p.id, v.status::public.return_status, v.reason, v.created::timestamptz
from (values
('41bf5f42-bc34-4d99-8ae1-5522635ed87e','AC10056','jordan@acme-retail.example','requested','Changed my mind after delivery.','2026-09-26T08:00:00.000Z'),
('34a74593-9e1e-471a-b46e-243fa9d9105a','AC10057','jordan@acme-retail.example','requested','Changed my mind after delivery.','2026-09-27T07:00:00.000Z'),
('668c417f-a62a-4c97-aafe-1c47c2caa42b','AC10058','jordan@acme-retail.example','requested','Changed my mind after delivery.','2026-09-28T06:00:00.000Z'),
('17cbfc71-095d-4d78-acee-2e27ff824957','AC10059','jordan@acme-retail.example','received','Changed my mind after delivery.','2026-09-29T05:00:00.000Z'),
('19d86ca8-0499-4e1d-8a81-43f232bf9d98','AC10060','jordan@acme-retail.example','received','Changed my mind after delivery.','2026-09-30T04:00:00.000Z')) as v(id, number, email, status, reason, created)
join public.orders o on o.number = v.number
join public.profiles p on p.email = v.email;

insert into public.return_items (return_id, order_item_id, quantity)
select v.rid::uuid, oi.id, v.qty::integer
from (values
('41bf5f42-bc34-4d99-8ae1-5522635ed87e','AC10056','ACME-RELAXED--INDIGO-34',1),
('34a74593-9e1e-471a-b46e-243fa9d9105a','AC10057','ACME-COURT-LE-WHITE-9',1),
('668c417f-a62a-4c97-aafe-1c47c2caa42b','AC10058','ACME-MERIDIAN-WHITE-M',1),
('17cbfc71-095d-4d78-acee-2e27ff824957','AC10059','ACME-POUR-OVE-GLASS',1),
('19d86ca8-0499-4e1d-8a81-43f232bf9d98','AC10060','ACME-LEATHER--TAN',1)) as v(rid, number, sku, qty)
join public.orders o on o.number = v.number
join public.order_items oi on oi.order_id = o.id and oi.sku = v.sku;

insert into public.refunds (order_id, amount_cents, kind, status, reason, created_by, created_at, completed_at)
select o.id, v.amount::integer, v.kind::public.refund_kind, v.status::public.refund_status, v.reason, p.id, v.created::timestamptz, v.completed::timestamptz
from (values
('AC10001','customer@acme-retail.example',1500,'partial','completed','Goodwill price adjustment.','2026-08-04T15:00:00.000Z','2026-08-04T15:00:00.000Z'),
('AC10002','customer@acme-retail.example',1500,'partial','completed','Goodwill price adjustment.','2026-08-05T14:00:00.000Z','2026-08-05T14:00:00.000Z'),
('AC10003','customer@acme-retail.example',1500,'partial','completed','Goodwill price adjustment.','2026-08-06T13:00:00.000Z','2026-08-06T13:00:00.000Z'),
('AC10053','jordan@acme-retail.example',40216,'full','completed','Cancelled before it shipped.','2026-09-23T11:00:00.000Z','2026-09-23T11:00:00.000Z'),
('AC10055','jordan@acme-retail.example',19052,'full','completed','Cancelled before it shipped.','2026-09-25T09:00:00.000Z','2026-09-25T09:00:00.000Z'),
('AC10059','jordan@acme-retail.example',16454,'full','completed','Return received.','2026-09-29T05:00:00.000Z','2026-09-29T05:00:00.000Z'),
('AC10060','jordan@acme-retail.example',6091,'full','completed','Return received.','2026-09-30T04:00:00.000Z','2026-09-30T04:00:00.000Z')) as v(number, email, amount, kind, status, reason, created, completed)
join public.orders o on o.number = v.number
join public.profiles p on p.email = v.email;

insert into public.domain_events (order_id, event_type, message, payload, created_at)
select o.id, 'order.seeded', 'Demo order ' || o.number || ' loaded.', jsonb_build_object('paymentStatus', o.payment_status, 'fulfillmentStatus', o.fulfillment_status), o.placed_at
from public.orders o;

insert into public.addresses (user_id, full_name, line1, line2, city, region, postal_code, country, phone, is_default)
select p.id, 'Avery Chen', '18 Cedar Lane', 'Apt 2', 'Portland', 'OR', '97205', 'United States', '', true
from public.profiles p where p.email = 'customer@acme-retail.example';

insert into public.addresses (user_id, full_name, line1, line2, city, region, postal_code, country, phone, is_default)
select p.id, 'Jordan Lee', '18 Cedar Lane', 'Apt 2', 'Portland', 'OR', '97205', 'United States', '', true
from public.profiles p where p.email = 'jordan@acme-retail.example';

insert into public.domain_events (event_type, message, payload) values ('simulation.reset', 'Demo catalog and orders were reset.', '{"products":40,"orders":60,"scenarios":7}'::jsonb);

select setval('public.order_number_seq', greatest(10060 + 1, 10601), false);
