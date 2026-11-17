import type { Availability, Player } from "../lib/types";

interface Props {
  players: Player[];
  availability: Availability[];
  onToggle: (playerId: number, isAvailable: boolean) => void;
  disabled?: boolean;
}

export default function AvailabilityList({
  players,
  availability,
  onToggle,
  disabled,
}: Props) {
  const availableByPlayer = new Map(
    availability.map((a) => [a.player_id, a.is_available])
  );

  return (
    <ul className="availability-list">
      {players.map((player) => {
        // undefined = todavia no respondio (distinto de "no voy")
        const response = availableByPlayer.get(player.id);
        return (
          <li key={player.id} className="availability-row">
            <span className="player-name">{player.name}</span>
            <div className="availability-toggle" role="group">
              <button
                type="button"
                className={"toggle-btn voy" + (response === true ? " selected" : "")}
                disabled={disabled}
                onClick={() => onToggle(player.id, true)}
              >
                Voy
              </button>
              <button
                type="button"
                className={"toggle-btn no-voy" + (response === false ? " selected" : "")}
                disabled={disabled}
                onClick={() => onToggle(player.id, false)}
              >
                No voy
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
