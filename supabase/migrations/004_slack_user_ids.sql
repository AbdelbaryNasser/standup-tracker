-- Seed slack_user_id for known team members, matched by email in auth.users
UPDATE profiles
SET slack_user_id = mapping.slack_id
FROM (
  VALUES
    ('abddelbary.nasser@tamm.com',  'U08FREE1FPD'),
    ('mohammad.youssef@tamm.com',   'U08BA14TQ8M'),
    ('issa.halabi@tamm.com',        'U0A4U2X8WH1'),
    ('mohammad.inamullah@tamm.com', 'U09MSR7FBPF'),
    ('karem@tamm.com',              'U0A6LPV3Q5U'),
    ('majd.foqahaa@tamm.com',       'U096NK5Q220'),
    ('hasan.alattas@tamm.com',      'U095VRL9J7N'),
    ('abdulrahman.alsayed@tamm.com','U0A3KAEHAF4'),
    ('hazem.hussien@tamm.com',      'U08DSSZPX3M')
) AS mapping(email, slack_id)
JOIN auth.users ON auth.users.email = mapping.email
WHERE profiles.id = auth.users.id;
