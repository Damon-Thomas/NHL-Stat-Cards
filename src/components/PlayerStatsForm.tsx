import type { PlayerCardData } from "../types";

interface PlayerStatsFormProps {
  playerCardData: PlayerCardData;
  naFields: Record<keyof PlayerCardData, boolean>;
  onInputChange: (field: keyof PlayerCardData, value: string) => void;
  onNaToggle: (field: keyof PlayerCardData) => void;
  onAutofillMaxValues: () => void;
  onClearAllValues: () => void;
}

const PlayerStatsForm = ({
  playerCardData,
  naFields,
  onInputChange,
  onNaToggle,
  onAutofillMaxValues,
  onClearAllValues,
}: PlayerStatsFormProps) => {
  // Input validation function
  const validateInput = (value: string): boolean => {
    // Allow empty string
    if (value === "") return true;

    // Allow "N/A" (case insensitive)
    if (value.toUpperCase() === "N/A") return true;

    // Check if it's a valid number between 0 and 99
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 99) {
      return true;
    }

    return false;
  };

  const handleInputChange = (field: keyof PlayerCardData, value: string) => {
    if (validateInput(value)) {
      onInputChange(field, value);
    }
  };

  // Helper component for form fields with NA checkbox (for specific fields only)
  const FormFieldWithNA = ({
    label,
    field,
    value,
    isNA,
  }: {
    label: string;
    field: keyof PlayerCardData;
    value: string;
    isNA: boolean;
  }) => (
    <label className="form-field">
      {label}:
      <div className="input-group">
        <label className="na-checkbox">
          <input
            type="checkbox"
            checked={isNA}
            onChange={() => onNaToggle(field)}
          />
          N/A
        </label>
        {!isNA && (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder="0-99"
            style={{ color: "#333" }}
          />
        )}
        {isNA && <span className="na-display">N/A</span>}
      </div>
    </label>
  );

  // Helper component for regular form fields (no NA checkbox)
  const FormField = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof PlayerCardData;
    value: string;
  }) => (
    <label className="form-field">
      {label}:
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder="0-99"
        style={{ color: "#333" }}
      />
    </label>
  );

  return (
    <div className="form-section-container">
      <div className="player-card-form">
        <div className="form-header">
          <h3>Player Statistics</h3>
          <div className="form-actions">
            <button
              type="button"
              onClick={onAutofillMaxValues}
              className="autofill-btn"
            >
              Autofill Max (99)
            </button>
            <button
              type="button"
              onClick={onClearAllValues}
              className="clear-btn"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="form-sections">
          <div className="form-section">
            <h4>Advanced Stats</h4>
            <div className="form-row">
              <FormField
                label="Proj. WAR"
                field="projWAR"
                value={playerCardData.projWAR}
              />
            </div>
            <div className="form-row">
              <FormField
                label="EV Offence"
                field="evOffence"
                value={playerCardData.evOffence}
              />
              <FormField
                label="EV Defence"
                field="evDefence"
                value={playerCardData.evDefence}
              />
            </div>
            <div className="form-row">
              <FormFieldWithNA
                label="PP"
                field="pp"
                value={playerCardData.pp}
                isNA={naFields.pp}
              />
              <FormFieldWithNA
                label="PK"
                field="pk"
                value={playerCardData.pk}
                isNA={naFields.pk}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Performance</h4>
            <div className="form-row">
              <FormFieldWithNA
                label="Finishing"
                field="finishing"
                value={playerCardData.finishing}
                isNA={naFields.finishing}
              />
              <FormField
                label="Goals"
                field="goals"
                value={playerCardData.goals}
              />
            </div>
            <div className="form-row">
              <FormField
                label="1st Assists"
                field="firstAssists"
                value={playerCardData.firstAssists}
              />
              <FormField
                label="Penalties"
                field="penalties"
                value={playerCardData.penalties}
              />
            </div>
            <div className="form-row">
              <FormField
                label="Competition"
                field="competition"
                value={playerCardData.competition}
              />
              <FormField
                label="Teammates"
                field="teammates"
                value={playerCardData.teammates}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>WAR Percentile Rank</h4>
            <div className="form-row">
              <FormFieldWithNA
                label="Year 1"
                field="warPercentileRankYr1"
                value={playerCardData.warPercentileRankYr1}
                isNA={naFields.warPercentileRankYr1}
              />
              <FormFieldWithNA
                label="Year 2"
                field="warPercentileRankYr2"
                value={playerCardData.warPercentileRankYr2}
                isNA={naFields.warPercentileRankYr2}
              />
              <FormFieldWithNA
                label="Year 3"
                field="warPercentileRankYr3"
                value={playerCardData.warPercentileRankYr3}
                isNA={naFields.warPercentileRankYr3}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Offense by Year</h4>
            <div className="form-row">
              <FormFieldWithNA
                label="Year 1"
                field="offenseYr1"
                value={playerCardData.offenseYr1}
                isNA={naFields.offenseYr1}
              />
              <FormFieldWithNA
                label="Year 2"
                field="offenseYr2"
                value={playerCardData.offenseYr2}
                isNA={naFields.offenseYr2}
              />
              <FormFieldWithNA
                label="Year 3"
                field="offenseYr3"
                value={playerCardData.offenseYr3}
                isNA={naFields.offenseYr3}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Defense by Year</h4>
            <div className="form-row">
              <FormFieldWithNA
                label="Year 1"
                field="defenseYr1"
                value={playerCardData.defenseYr1}
                isNA={naFields.defenseYr1}
              />
              <FormFieldWithNA
                label="Year 2"
                field="defenseYr2"
                value={playerCardData.defenseYr2}
                isNA={naFields.defenseYr2}
              />
              <FormFieldWithNA
                label="Year 3"
                field="defenseYr3"
                value={playerCardData.defenseYr3}
                isNA={naFields.defenseYr3}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Finishing by Year</h4>
            <div className="form-row">
              <FormFieldWithNA
                label="Year 1"
                field="finishingYr1"
                value={playerCardData.finishingYr1}
                isNA={naFields.finishingYr1}
              />
              <FormFieldWithNA
                label="Year 2"
                field="finishingYr2"
                value={playerCardData.finishingYr2}
                isNA={naFields.finishingYr2}
              />
              <FormFieldWithNA
                label="Year 3"
                field="finishingYr3"
                value={playerCardData.finishingYr3}
                isNA={naFields.finishingYr3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsForm;
