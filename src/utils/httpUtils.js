const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUuid = (value) => typeof value === 'string' && UUID_REGEX.test(value);

export const normalizeQuery = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

export const sendDatabaseError = (res, error, fallbackStatus = 400) => {
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'Data sudah ada (duplikat).' });
  }

  if (error?.code === '23503') {
    return res.status(409).json({ error: 'Data masih terhubung dengan entitas lain.' });
  }

  if (error?.code === '22P02') {
    return res.status(400).json({ error: 'Format UUID tidak valid.' });
  }

  if (error?.code === '23514') {
    return res.status(400).json({ error: 'Data tidak memenuhi aturan constraint database.' });
  }

  return res.status(fallbackStatus).json({ error: error.message });
};
