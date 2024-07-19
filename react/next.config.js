module.exports = {
    async rewrites() {
        return [
          {
            source: '/api/nutrition',
            destination: 'http://127.0.0.1:5000/nutrition',
          },
        ]
      },
  };