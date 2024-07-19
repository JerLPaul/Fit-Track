module.exports = {
    async rewrites() {
        return [
          {
            source: '/api/nutrition',
            destination: 'https://fit-track-backend.onrender.com/nutrition/',
          },
        ]
      },
  };