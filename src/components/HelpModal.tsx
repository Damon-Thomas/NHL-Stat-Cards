interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl flex-1 font-bold text-gray-800">
            How to Use NHL Stat Cards
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Team Selection */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2L3 7v11h14V7l-7-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                1. Select a Team
              </h3>
            </div>
            <div className="sm:ml-16">
              <p className="text-gray-600 mb-2">
                Click on the team logo (top-left) to open the team dropdown
                menu. Choose from any of the 32 NHL teams.
              </p>
              <p className="text-sm text-blue-600 font-medium">
                💡 Tip: The team colors will automatically update the card
                design
              </p>
            </div>
            <details className="group mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                Watch Video
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <video
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                >
                  <source src="/videos/ChangeTeam.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          </div>

          {/* Player Selection */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                2. Choose a Player
              </h3>
            </div>
            <div className="sm:ml-16">
              <p className="text-gray-600 mb-2">
                After selecting a team, click on the player name area to view
                the roster. Players are sorted alphabetically by last name.
              </p>
              <p className="text-sm text-blue-600 font-medium">
                💡 Tip: Player photos and information load automatically when
                selected
              </p>
            </div>
            <details className="group mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                Watch Video
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <video
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                >
                  <source src="/videos/SelectPlayer.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          </div>

          {/* Edit Stats */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                3. Edit Player Stats
              </h3>
            </div>
            <div className="sm:ml-16">
              <p className="text-gray-600 mb-2">
                Click on any stat box to edit the values. You can customize:
              </p>
              <ul className="text-sm text-gray-600 ml-4 space-y-1">
                <li>• WAR (Wins Above Replacement) - main stat</li>
                <li>• EV Offense & Defense (Even Strength)</li>
                <li>• PP (Power Play) & PK (Penalty Kill)</li>
                <li>• Goals, Assists, and other advanced metrics</li>
              </ul>
              <p className="text-sm text-blue-600 font-medium mt-2">
                💡 Tip: A "0" or empty value will be corrected to show "NA"
              </p>
            </div>
            <details className="group mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                Watch Video
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <video
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                >
                  <source src="/videos/EditStats.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          </div>

          {/* Edit Graphs */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700">
                4. Customize Performance Graphs
              </h3>
            </div>
            <div className="sm:ml-16">
              <p className="text-gray-600 mb-2">
                The right side shows two interactive performance graphs. Drag
                any of the dots up or down to adjust the graphs.
              </p>
              <ul className="text-sm text-gray-600 ml-4 space-y-1">
                <li>
                  • <strong>WAR Percentile Rank</strong> - Shows overall
                  performance ranking
                </li>
                <li>
                  • <strong>Offense vs Defense vs Finishing</strong> - Compares
                  three key skill areas
                </li>
              </ul>
              <p className="text-sm text-blue-600 font-medium mt-2">
                💡 Tip: Graphs update automatically as you edit stats
              </p>
            </div>
            <details className="group mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                Watch Video
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <video
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                >
                  <source src="/videos/LineGraphEdit.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          </div>

          {/* Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Ready to Share?
            </h3>
            <p className="text-blue-700">
              Click the <strong>"Download Card"</strong> button in the header to
              save your custom player card as a high-quality PNG image.
            </p>
            <details className="group mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm">
                Watch Video
              </summary>
              <div className="mt-2 p-3 bg-white rounded-lg">
                <video
                  className="w-full h-auto rounded-lg"
                  controls
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                >
                  <source src="/videos/DownloadCard.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </details>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it, let's start!
          </button>
        </div>
      </div>
    </div>
  );
}
