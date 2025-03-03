SELECT 
    ph.id,
    ph.password_id,
    p.password_value,
    ph.action,
    ph.action_timestamp,
    p.label
FROM password_history ph
LEFT JOIN passwords p ON ph.password_id = p.id
ORDER BY ph.action_timestamp DESC;
