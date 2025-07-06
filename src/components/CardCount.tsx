interface CardCountProps {
  count: number;
}

const CardCount = ({ count }: CardCountProps) => {
  return (
    <>
      <h1 className="hidden sm:block text-2xl font-bold">NHL Stat Cards</h1>
      <p>
        Total Player Cards Created: <strong>{count}</strong>
      </p>
    </>
  );
};

export default CardCount;
