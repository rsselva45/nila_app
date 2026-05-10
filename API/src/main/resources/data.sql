-- Seed available content components (idempotent – INSERT OR IGNORE)
INSERT OR IGNORE INTO components
    (id, title, short_description, type, approximate_duration_minutes, metadata_json)
VALUES
    ('cmp-assess-math-1',
     'Math Module 1 Assessment',
     'Baseline math diagnostic used to route learners.',
     'assessment', 35,
     '{"assessment":{"maxScore":100,"passingScore":50}}'),

    ('cmp-unit-math-2-easy',
     'Math Module 2 - Easy',
     'Foundational math remediation unit for learners scoring below 50%.',
     'unit', 35,
     '{"unit":{"recommendedMinutes":30}}'),

    ('cmp-assess-math-2-adv',
     'Math Module 2 - Advanced',
     'Advanced math enrichment for high scorers.',
     'assessment', 35,
     '{"assessment":{"maxScore":100,"passingScore":70}}'),

    ('cmp-assess-rc-1',
     'Reading & Comp Module 1',
     'Core reading comprehension diagnostic assessment.',
     'assessment', 32,
     '{"assessment":{"maxScore":100,"passingScore":50}}'),

    ('cmp-unit-rc-2-easy',
     'R&C Module 2 - Easy',
     'Foundational reading comprehension remediation unit.',
     'unit', 32,
     '{"unit":{"recommendedMinutes":27}}'),

    ('cmp-assess-rc-2-adv',
     'R&C Module 2 - Advanced',
     'Advanced reading comprehension enrichment.',
     'assessment', 32,
     '{"assessment":{"maxScore":100,"passingScore":70}}'),

    ('cmp-unit-algebra',
     'Algebra Fundamentals',
     'Core algebra skills and equation solving unit.',
     'unit', 45,
     '{"unit":{"recommendedMinutes":40}}'),

    ('cmp-assess-geometry',
     'Geometry Assessment',
     'Spatial reasoning and geometry diagnostic.',
     'assessment', 40,
     '{"assessment":{"maxScore":100,"passingScore":60}}'),

    ('cmp-unit-writing',
     'Essay Writing Unit',
     'Guided essay writing and grammar practice.',
     'unit', 50,
     '{"unit":{"recommendedMinutes":45}}');
