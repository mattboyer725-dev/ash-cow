-- Prices can have cents (e.g. $9.99). Keep exact dollar amounts instead of rounding to whole dollars.
alter table sales alter column amount type numeric(10, 2) using amount::numeric(10, 2);
