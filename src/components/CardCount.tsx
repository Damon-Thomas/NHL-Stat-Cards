interface CardCountProps {
  count: number;
}

const CardCount = ({ count }: CardCountProps) => {
  return (
    <div className="flex flex-col items-start">
      <h1 className="hidden sm:block text-2xl font-bold mb-1">
        NHL Stat Cards
      </h1>
      <p className="text-sm sm:text-base text-center sm:text-left">
        <span className="block sm:inline">Player Cards</span>{" "}
        <span className="block sm:inline">
          Created: <strong>{count}</strong>
        </span>
      </p>
    </div>
  );
};

export default CardCount;
