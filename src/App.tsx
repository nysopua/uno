import { useState, useEffect } from 'react';
import ScoreInput from './components/ScoreInput';
import GameSetup from './components/GameSetup';
import ScoreBoard from './components/ScoreBoard';

// プレイヤー型定義
export interface Player {
  id: number;
  name: string;
  scores: number[];
  totalScore: number;
}

// ゲーム状態型定義
interface GameState {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  isGameSetup: boolean;
  roundMultipliers: number[]; // 各ラウンドの倍率
}

// ローカルストレージのキー
const STORAGE_KEY = 'uno_score_app_state';

function App() {
  // ゲーム状態の初期化（ローカルストレージから復元を試みる）
  const [gameState, setGameState] = useState<GameState>(() => {
    // ローカルストレージからデータを取得
    const savedState = localStorage.getItem(STORAGE_KEY);
    
    if (savedState) {
      try {
        // JSON文字列をパースしてゲーム状態を復元
        return JSON.parse(savedState) as GameState;
      } catch (e) {
        console.error('ローカルストレージのデータの解析に失敗しました:', e);
      }
    }
    
    // デフォルト値を返す（保存データがない場合）
    return {
      players: [],
      currentRound: 0,
      totalRounds: 0,
      isGameSetup: false,
      roundMultipliers: [],
    };
  });

  // ゲーム状態が変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // ゲーム設定を保存する関数（倍率情報も受け取る）
  const handleGameSetup = (playerNames: string[], totalRounds: number, roundMultipliers: number[]) => {
    const players = playerNames.map((name, index) => ({
      id: index,
      name,
      scores: Array(totalRounds).fill(0),
      totalScore: 0,
    }));

    setGameState({
      players,
      currentRound: 0,
      totalRounds,
      isGameSetup: true,
      roundMultipliers, // ゲーム設定から受け取った倍率を使用
    });
  };

  // スコアを更新する関数
  const handleScoreUpdate = (scores: number[]) => {
    if (gameState.currentRound >= gameState.totalRounds) return;

    // 現在のラウンドの倍率を取得
    const currentMultiplier = gameState.roundMultipliers[gameState.currentRound];

    const updatedPlayers = gameState.players.map((player, index) => {
      const newScores = [...player.scores];
      // 倍率を適用したスコアを記録
      newScores[gameState.currentRound] = scores[index] * currentMultiplier;
      
      // 合計スコアを再計算
      return {
        ...player,
        scores: newScores,
        totalScore: newScores.reduce((sum, score) => sum + score, 0),
      };
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentRound: gameState.currentRound + 1,
    });
  };

  // 保存されたゲームをクリアする関数
  const clearSavedGame = () => {
    if (window.confirm('保存されたゲームデータをクリアしますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      setGameState({
        players: [],
        currentRound: 0,
        totalRounds: 0,
        isGameSetup: false,
        roundMultipliers: [],
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-6xl font-bold text-blue-600">UNO</h1>
        {gameState.isGameSetup && (
          <div className="flex space-x-2">
            <button
              onClick={clearSavedGame}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              保存データをクリア
            </button>
          </div>
        )}
      </div>
      
      {!gameState.isGameSetup ? (
        <div>
          <p className="mb-4 text-gray-600">
            {localStorage.getItem(STORAGE_KEY) ? 
              '前回のゲームデータが復元されました。新しいゲームを始めるには設定を行ってください。' : 
              'ゲームを始めるには、参加者とラウンド数を設定してください。'}
          </p>
          <GameSetup onSubmit={handleGameSetup} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
            <p className="text-lg font-medium">
              ラウンド: <span className="font-bold">{Math.min(gameState.currentRound + 1, gameState.totalRounds)}</span> / <span className="font-bold">{gameState.totalRounds}</span>
              {gameState.currentRound < gameState.totalRounds && gameState.roundMultipliers[gameState.currentRound] > 1 && (
                <span className="ml-2 text-amber-600 font-bold">
                  （{gameState.roundMultipliers[gameState.currentRound]}倍ラウンド）
                </span>
              )}
            </p>
            <div>
              <p className="text-sm text-gray-500">
                データは自動保存されています
              </p>
            </div>
          </div>
          
          {gameState.currentRound < gameState.totalRounds && (
            <ScoreInput 
              players={gameState.players} 
              onSubmit={handleScoreUpdate} 
              roundNumber={gameState.currentRound + 1}
              currentRoundMultiplier={gameState.roundMultipliers[gameState.currentRound]}
            />
          )}
          
          <ScoreBoard 
            players={gameState.players} 
            roundMultipliers={gameState.roundMultipliers} 
          />
        </>
      )}
      
      {/* Footer with storage information */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>データはブラウザのローカルストレージに保存されています。ブラウザのデータをクリアするとゲームデータも失われます。</p>
      </div>
    </div>
  );
}

export default App;