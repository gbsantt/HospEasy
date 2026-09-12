module.exports = ({ config }) => {
  const base = (process.env.EXPO_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  if (base && !/^\/[a-zA-Z0-9/_-]+$/.test(base)) throw new Error('EXPO_PUBLIC_BASE_PATH deve ser um caminho absoluto, sem domínio ou query.');
  return { ...config, scheme: 'hospeasy', experiments: { ...config.experiments, baseUrl: base } };
};
