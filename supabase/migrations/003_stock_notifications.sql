create table if not exists stock_notifications (
  id          uuid        default gen_random_uuid() primary key,
  product_id  uuid        references products(id) on delete cascade not null,
  email       text        not null,
  created_at  timestamptz default now() not null,
  notified_at timestamptz,
  unique(product_id, email)
);

alter table stock_notifications enable row level security;
