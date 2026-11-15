# Week 9 – Database performance (checkpoint 53)

Measured through the running app (`GET /api/properties?limit=20&offset=0&...`),
median of 5 requests each, MySQL 8 in Docker, 55,212 rows in `rets_property`.

## Indexes added

```sql
-- Sorting (date listed, square footage had no index)
CREATE INDEX idx_contract_date    ON rets_property (ListingContractDate);
CREATE INDEX idx_sqft             ON rets_property (LM_Int2_3);

-- Composite indexes for common filter combinations
-- Equality columns first (beds, baths), range column (price) last.
CREATE INDEX idx_beds_baths_price ON rets_property (L_Keyword2, LM_Dec_3, L_SystemPrice);
CREATE INDEX idx_city_price       ON rets_property (L_City, L_SystemPrice);
```

Verify:

```sql
SHOW INDEX FROM rets_property;
```

## Filter combinations: before vs after composite indexes

| Filter combination | Results | Before | After |
|---|---:|---:|---:|
| beds + baths + price range | 5,243 | 2,715 ms | 17 ms |
| city + price range | 2,217 | 27 ms | 15 ms |
| city + price range + sort by price | 2,217 | 41 ms | 17 ms |
| zip + price range | 173 | 17 ms | 15 ms |
| beds + baths | 9,481 | 25 ms | 22 ms |
| price range only | 25,217 | 19 ms | 20 ms |
| city + beds | 214 | 25 ms | 23 ms |

Result counts are identical before and after, so the indexes changed speed only.

## Sorting

| Sort | Before | After |
|---|---:|---:|
| Price (SELECT * + ORDER BY, original query) | 10,375 ms | — |
| Price (deferred-join query, existing index) | — | 29–69 ms |
| Date listed | 4,157 ms | 30–53 ms |
| Square footage | 4,132 ms | 43–50 ms |

The deferred join sorts only `id` values in a subquery and then fetches full rows
for the 20 results on the page, instead of sorting all 55k wide rows.
