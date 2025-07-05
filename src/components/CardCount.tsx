interface CardCountProps {
  count: number;
}

const CardCount = ({ count }: CardCountProps) => {
  return (
    <div className="card-count">
      <p>
        Total Player Cards Created: <strong>{count}</strong>
      </p>
    </div>
  );
};

export default CardCount;
