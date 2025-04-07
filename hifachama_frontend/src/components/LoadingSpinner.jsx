const LoadingSpinner = ({ fullPage = false, size = 'medium' }) => {
  const sizes = {
    small: 'h-8 w-8 border-t-2 border-b-2',
    medium: 'h-12 w-12 border-t-2 border-b-2',
    large: 'h-16 w-16 border-t-4 border-b-4'
  };

  return (
    <div className={`flex items-center justify-center ${
      fullPage ? 'h-screen' : 'py-12'
    }`}>
      <div className={`animate-spin rounded-full ${
        sizes[size]
      } border-indigo-500`}></div>
    </div>
  );
};

export default LoadingSpinner;
