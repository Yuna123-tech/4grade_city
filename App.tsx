import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  Player, 
  Tile, 
  TileType, 
  PLAYER_COLORS, 
  INITIAL_MONEY, 
  GameEvent,
  QuizQuestion
} from './types';
import { BOARD_DATA, GAME_EVENTS, QUIZ_POOL } from './constants';
import TileComponent from './components/TileComponent';
import QuizModal from './components/QuizModal';

const SELECTABLE_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

/**
 * FIREBASE INTEGRATION GUIDE (For Multiplayer)
 * ---------------------------------------------
 * 1. Create a Firebase project at console.firebase.google.com
 * 2. Add 'firebase' package: npm install firebase
 * 3. Create a firebaseConfig.ts file with your keys.
 * 4. In App.tsx:
 *    - Import initializeApp and getDatabase.
 *    - Use useEffect to subscribe to a room path (e.g., 'games/room1') using 'onValue'.
 *    - Replace all setGame calls with update() calls to Firebase.
 *    - This allows all players to see the same state updates in real-time.
 */

const App: React.FC = () => {
  // --- State Initialization ---
  const [setupMode, setSetupMode] = useState(true);
  const [playerCount, setPlayerCount] = useState(4);
  const [setupPlayers, setSetupPlayers] = useState<Array<{name: string, color: string}>>([]);
  
  const [game, setGame] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    tiles: JSON.parse(JSON.stringify(BOARD_DATA)), // Deep copy
    status: 'SETUP',
    turnPhase: 'ROLL',
    diceValues: [1, 1],
    isDouble: false,
    quizActive: false,
    currentQuiz: null,
    message: '게임을 시작하려면 플레이어 설정을 완료해주세요.',
    round: 1,
    maxRounds: 15,
    isSpaceTravelActive: false
  });
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  
  // Ref to track if movement is in progress to prevent double clicks
  const isMovingRef = useRef(false);

  // --- Setup Logic ---
  useEffect(() => {
    // Initialize setup players when player count changes
    setSetupPlayers(prev => {
      const newSetup = [];
      for (let i = 0; i < playerCount; i++) {
        if (i < prev.length) {
          newSetup.push(prev[i]);
        } else {
          // Default values for new players
          newSetup.push({
            name: `플레이어 ${i + 1}`,
            color: PLAYER_COLORS[i % PLAYER_COLORS.length]
          });
        }
      }
      return newSetup;
    });
  }, [playerCount]);

  const updateSetupPlayer = (index: number, field: 'name' | 'color', value: string) => {
    setSetupPlayers(prev => {
      const newSetup = [...prev];
      newSetup[index] = { ...newSetup[index], [field]: value };
      return newSetup;
    });
  };

  // --- Helpers ---
  const addLog = (text: string) => {
    setGame(prev => ({ ...prev, message: text }));
  };

  const getRandomQuiz = (): QuizQuestion => {
    const randomIndex = Math.floor(Math.random() * QUIZ_POOL.length);
    return QUIZ_POOL[randomIndex];
  };

  const endTurnOrRepeat = () => {
    if (game.isSpaceTravelActive) {
      addLog("이동할 지역을 선택해주세요!");
      return;
    }

    if (game.isDouble) {
        addLog(`${game.players[game.currentPlayerIndex].name}님이 더블을 기록했습니다! 한 번 더 던지세요.`);
        setGame(prev => ({
            ...prev,
            turnPhase: 'ROLL',
            // Double flag stays true to indicate bonus turn, but logic handles reset on next roll
            message: `더블! ${prev.players[prev.currentPlayerIndex].name}의 차례가 계속됩니다.`
        }));
    } else {
        nextTurn();
    }
  };

  const nextTurn = () => {
    setGame(prev => {
      let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      let newRound = prev.round;
      
      // If we wrapped around to player 0, increment round
      if (nextIndex === 0) {
        newRound = prev.round + 1;
      }
      
      // Check Game Over
      if (newRound > (prev.maxRounds || 15)) {
        return {
           ...prev,
           status: 'GAME_OVER',
           message: '게임 종료! 결과를 확인하세요.'
        };
      }

      // Check for skipped players
      let attempts = 0;
      while (prev.players[nextIndex].isSkipped && attempts < prev.players.length) {
        // Unskip player but consume their turn
        const skippedPlayers = [...prev.players];
        skippedPlayers[nextIndex] = { ...skippedPlayers[nextIndex], isSkipped: false };
        
        // Prepare next iteration
        nextIndex = (nextIndex + 1) % prev.players.length;
        if (nextIndex === 0) newRound++;
        attempts++;
        
        if (newRound > (prev.maxRounds || 15)) {
            return {
               ...prev,
               players: skippedPlayers,
               status: 'GAME_OVER',
               message: '게임 종료! 결과를 확인하세요.'
            };
        }

        prev = { ...prev, players: skippedPlayers, round: newRound };
      }

      return {
        ...prev,
        currentPlayerIndex: nextIndex,
        turnPhase: 'ROLL',
        round: newRound,
        isDouble: false,
        message: `${prev.players[nextIndex].name}의 차례입니다! 주사위를 굴려주세요.`
      };
    });
  };

  // --- Game Actions ---

  const startGame = () => {
    const newPlayers: Player[] = setupPlayers.map((p, i) => ({
      id: i,
      name: p.name || `플레이어 ${i + 1}`,
      money: INITIAL_MONEY,
      position: 0,
      color: p.color,
      isSkipped: false,
      assets: []
    }));

    setGame({
      ...game,
      players: newPlayers,
      status: 'PLAYING',
      message: `${newPlayers[0].name}의 차례입니다!`,
      round: 1
    });
    setSetupMode(false);
  };

  const rollDice = async () => {
    if (game.turnPhase !== 'ROLL' || isMovingRef.current) return;

    // Transition to ROLLING phase
    setGame(prev => ({ 
      ...prev, 
      turnPhase: 'ROLLING', 
      message: '주사위를 굴리는 중...' 
    }));

    // Dice animation effect
    const fastRolls = 10;
    const slowRolls = 5;

    for(let i=0; i<fastRolls; i++) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setGame(prev => ({ ...prev, diceValues: [d1, d2] }));
        await new Promise(r => setTimeout(r, 60)); 
    }
    
    for(let i=0; i<slowRolls; i++) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        setGame(prev => ({ ...prev, diceValues: [d1, d2] }));
        const delay = 100 + (i * 60); 
        await new Promise(r => setTimeout(r, delay));
    }
    
    const finalDie1 = Math.floor(Math.random() * 6) + 1;
    const finalDie2 = Math.floor(Math.random() * 6) + 1;
    const totalMoves = finalDie1 + finalDie2;
    const isDouble = finalDie1 === finalDie2;

    setGame(prev => ({ 
      ...prev, 
      diceValues: [finalDie1, finalDie2],
      isDouble: isDouble,
      turnPhase: 'MOVING',
      message: `${totalMoves}칸 이동합니다! ${isDouble ? '(더블!)' : ''}` 
    }));

    // Trigger step-by-step movement
    movePlayerStepByStep(totalMoves);
  };

  const movePlayerStepByStep = async (steps: number) => {
    isMovingRef.current = true;
    const totalTiles = game.tiles.length;
    let currentSteps = 0;
    
    // We need to access the latest state in loop.
    let currentPosition = game.players[game.currentPlayerIndex].position;
    const currentPlayerIdx = game.currentPlayerIndex;

    while (currentSteps < steps) {
        await new Promise(r => setTimeout(r, 300)); // Animation delay per step

        currentPosition = (currentPosition + 1) % totalTiles;
        currentSteps++;

        // Pass Go (Start Tile) Check - Instant reward visual
        let salaryBonus = 0;
        let bonusMsg = '';
        if (currentPosition === 0) { 
            salaryBonus = 500;
            bonusMsg = ' (월급 +500)';
        }

        setGame(prev => {
            const newPlayers = [...prev.players];
            if (salaryBonus > 0) {
                 newPlayers[currentPlayerIdx].money += salaryBonus;
            }
            newPlayers[currentPlayerIdx].position = currentPosition;

            return {
                ...prev,
                players: newPlayers,
                message: `${currentSteps}칸 이동...${bonusMsg}`
            };
        });
    }

    // Movement finished
    isMovingRef.current = false;
    
    // Wait a moment before triggering tile event
    await new Promise(r => setTimeout(r, 500));
    
    setGame(prev => ({
        ...prev,
        turnPhase: 'ACTION',
        message: '도착!'
    }));
  };

  // Effect to handle tile landing events automatically
  useEffect(() => {
    if (game.turnPhase === 'ACTION' && !game.isSpaceTravelActive) {
      const player = game.players[game.currentPlayerIndex];
      const tile = game.tiles[player.position];
      
      handleTileEvent(tile, player);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turnPhase, game.currentPlayerIndex, game.isSpaceTravelActive]); 

  const handleTileEvent = async (tile: Tile, player: Player) => {
    // 1. Start Tile
    if (tile.type === TileType.START) {
       addLog('출발점에 도착했습니다. (보너스 지급 완료)');
       setGame(prev => ({...prev, turnPhase: 'END'}));
       return;
    }

    // 2. Donation (Tax)
    if (tile.type === TileType.DONATION) {
       const fine = tile.id === 7 ? 200 : 300; 
       addLog(`${tile.name}: ${fine}구름을 지불합니다.`);
       updateMoney(player.id, -fine);
       setGame(prev => ({...prev, turnPhase: 'END'}));
       return;
    }

    // 3. Park / Island (Skip Turn)
    if (tile.name === '무인도') {
        addLog('무인도에 갇혔습니다! 다음 턴을 쉽니다.');
        setGame(prev => {
            const newPlayers = [...prev.players];
            newPlayers[prev.currentPlayerIndex].isSkipped = true;
            return { ...prev, players: newPlayers, turnPhase: 'END', isDouble: false };
        });
        return;
    }
    if (tile.type === TileType.PARK) {
        addLog('공원에서 편안하게 휴식을 취합니다. (+100구름)');
        updateMoney(player.id, 100);
        setGame(prev => ({...prev, turnPhase: 'END'}));
        return;
    }

    // 4. Quiz
    if (tile.type === TileType.QUIZ) {
        addLog('퀴즈 타임! 문제를 풀면 보너스를 받습니다.');
        setIsQuizLoading(true);
        // Simulate loading for effect
        await new Promise(resolve => setTimeout(resolve, 600));
        const question = getRandomQuiz();
        setIsQuizLoading(false);
        setGame(prev => ({
            ...prev,
            quizActive: true,
            currentQuiz: question
        }));
        return;
    }

    // 5. Random Event
    if (tile.type === TileType.EVENT) {
        const randomEvent = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
        addLog(`📢 [소식] ${randomEvent.title}`);
        
        await new Promise(r => setTimeout(r, 1000));
        addLog(`${randomEvent.description}`);
        
        await new Promise(r => setTimeout(r, 1000));
        
        if (randomEvent.type === 'TRAVEL') {
           setGame(prev => ({
             ...prev,
             isSpaceTravelActive: true,
             message: "🚀 이동하고 싶은 지역을 선택하세요!"
           }));
           return;
        }

        setGame(prev => {
            const newPlayers = [...prev.players];
            const p = newPlayers[prev.currentPlayerIndex];
            let shouldEndTurn = true;
            let clearDouble = false;
            
            if (randomEvent.type === 'MONEY') {
                p.money += randomEvent.value;
                if (p.money < 0) p.money = 0; 
            } else if (randomEvent.type === 'SKIP') {
                p.isSkipped = true;
                clearDouble = true; // Lost turn means no double bonus
            } else if (randomEvent.type === 'MOVE') {
                let newPos = p.position + randomEvent.value;
                if (newPos < 0) newPos = prev.tiles.length + newPos; 
                newPos = newPos % prev.tiles.length;
                p.position = newPos;
            }
            
            return { 
                ...prev, 
                players: newPlayers, 
                turnPhase: 'END',
                isDouble: clearDouble ? false : prev.isDouble
            };
        });
        return;
    }

    // 6. City Logic
    if (tile.type === TileType.CITY) {
        if (tile.ownerId === null) {
            addLog(`${tile.name}에 도착했습니다. (가격: ${tile.price}구름)`);
        } else if (tile.ownerId === player.id) {
             addLog(`자신의 도시 ${tile.name}에 왔습니다. 건물을 업그레이드할 수 있습니다.`);
        } else {
            // Opponent city
            const rent = calculateRent(tile);
            addLog(`${game.players[tile.ownerId].name}님의 땅입니다. 통행료 ${rent}구름을 지불합니다.`);
            
            setGame(prev => {
                const newPlayers = [...prev.players];
                newPlayers[player.id].money -= rent;
                if (tile.ownerId !== null) {
                   newPlayers[tile.ownerId].money += rent;
                }
                return { ...prev, players: newPlayers, turnPhase: 'END' };
            });
        }
    }
  };

  const handleTileClick = (tile: Tile) => {
    // Space Travel Logic
    if (game.isSpaceTravelActive) {
      setGame(prev => {
        const newPlayers = [...prev.players];
        const currentPlayer = newPlayers[prev.currentPlayerIndex];
        
        // Update position
        currentPlayer.position = tile.id;

        return {
          ...prev,
          players: newPlayers,
          isSpaceTravelActive: false, // End travel mode
          turnPhase: 'ACTION', // Proceed to action on the new tile
          message: `${tile.name}(으)로 순간이동 했습니다!`
        };
      });
      // The useEffect for ACTION phase will trigger handleTileEvent automatically
      return;
    }
    
    // Normal info click
    console.log("Tile clicked:", tile);
  };

  const calculateRent = (tile: Tile) => {
    return tile.rent + (tile.rent * tile.buildingLevel);
  };

  const handleBuyCity = () => {
      const player = game.players[game.currentPlayerIndex];
      const tile = game.tiles[player.position];

      if (player.money >= tile.price) {
          setGame(prev => {
              const newPlayers = [...prev.players];
              newPlayers[player.id].money -= tile.price;
              newPlayers[player.id].assets.push(tile.id);
              
              const newTiles = [...prev.tiles];
              newTiles[tile.id] = { ...tile, ownerId: player.id, buildingLevel: 0 };
              
              return { 
                  ...prev, 
                  players: newPlayers, 
                  tiles: newTiles, 
                  turnPhase: 'END',
                  message: `${tile.name}을(를) 구매했습니다!` 
              };
          });
      } else {
          addLog('돈이 부족하여 구매할 수 없습니다.');
          setGame(prev => ({...prev, turnPhase: 'END'}));
      }
  };

  const handleUpgradeCity = () => {
    const player = game.players[game.currentPlayerIndex];
    const tile = game.tiles[player.position];
    const upgradeCost = Math.floor(tile.price * 0.5);

    if (tile.buildingLevel >= 2) {
        addLog('더 이상 건물을 높일 수 없습니다.');
        setGame(prev => ({...prev, turnPhase: 'END'}));
        return;
    }

    if (player.money >= upgradeCost) {
        setGame(prev => {
            const newPlayers = [...prev.players];
            newPlayers[player.id].money -= upgradeCost;
            
            const newTiles = [...prev.tiles];
            newTiles[tile.id] = { ...tile, buildingLevel: tile.buildingLevel + 1 };
            
            return { 
                ...prev, 
                players: newPlayers, 
                tiles: newTiles, 
                turnPhase: 'END',
                message: `건물을 증축했습니다! (레벨 ${tile.buildingLevel + 1})` 
            };
        });
    } else {
        addLog('돈이 부족하여 증축할 수 없습니다.');
        setGame(prev => ({...prev, turnPhase: 'END'}));
    }
  };

  const handlePass = () => {
    const player = game.players[game.currentPlayerIndex];
    const tile = game.tiles[player.position];
    const canBuy = game.turnPhase === 'ACTION' && tile.type === TileType.CITY && tile.ownerId === null && player.money >= tile.price;
    const canUpgrade = game.turnPhase === 'ACTION' && tile.type === TileType.CITY && tile.ownerId === player.id && tile.buildingLevel < 2 && player.money >= Math.floor(tile.price * 0.5);
    
    if (canBuy) {
        addLog('구매하지 않고 지나갑니다.');
    } else if (canUpgrade) {
        addLog('증축하지 않습니다.');
    }
    setGame(prev => ({ ...prev, turnPhase: 'END' }));
  };

  const updateMoney = (playerId: number, amount: number) => {
    setGame(prev => {
        const newPlayers = [...prev.players];
        newPlayers[playerId].money += amount;
        return { ...prev, players: newPlayers };
    });
  };

  const handleQuizResult = (isCorrect: boolean) => {
      setGame(prev => ({ ...prev, quizActive: false, currentQuiz: null }));
      if (isCorrect) {
          addLog('정답입니다! 상금 300구름을 획득했습니다.');
          updateMoney(game.currentPlayerIndex, 300);
      } else {
          addLog('틀렸습니다. 아쉽네요.');
      }
      setGame(prev => ({ ...prev, turnPhase: 'END' }));
  };

  const calculateFinalScores = () => {
      return game.players.map(p => {
          const assetsValue = p.assets.reduce((sum, tileId) => {
              const tile = game.tiles[tileId];
              return sum + tile.price + (tile.price * 0.5 * tile.buildingLevel);
          }, 0);
          return { ...p, score: p.money + assetsValue, assetsValue };
      }).sort((a, b) => b.score - a.score);
  };

  const getGridStyle = (index: number) => {
      // 0 is Bottom Right (6,6)
      if (index === 0) return { gridColumn: 6, gridRow: 6 };
      // 1-5 Bottom Row
      if (index >= 1 && index <= 5) return { gridColumn: 6 - index, gridRow: 6 };
      // 6-9 Right Col
      if (index >= 6 && index <= 9) return { gridColumn: 1, gridRow: 6 - (index - 5) };
      // 10 is Top Left (1,1)
      if (index === 10) return { gridColumn: 1, gridRow: 1 };
      // 11-15 Top Row
      if (index >= 11 && index <= 15) return { gridColumn: (index - 10) + 1, gridRow: 1 };
      // 16-19 Left Col
      if (index >= 16 && index <= 19) return { gridColumn: 6, gridRow: (index - 15) + 1 };
      
      return {};
  };

  // Setup Screen
  if (setupMode) {
      return (
          <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center border-4 border-blue-200 overflow-y-auto max-h-[90vh]">
                  <h1 className="text-3xl md:text-4xl font-jua text-blue-600 mb-2">🏙️ 우리 고장 도시 탐험대</h1>
                  <p className="text-gray-500 mb-6">참가 인원과 이름을 정해주세요!</p>
                  
                  <div className="mb-8">
                      <label className="block text-gray-700 font-bold mb-3 text-lg">참가 인원</label>
                      <div className="flex justify-center gap-4">
                          {[2, 3, 4, 5].map(num => (
                              <button
                                  key={num}
                                  onClick={() => setPlayerCount(num)}
                                  className={`w-12 h-12 rounded-full font-bold text-xl transition-all ${playerCount === num ? 'bg-blue-500 text-white transform scale-110 shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                              >
                                  {num}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                      {setupPlayers.map((p, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-700 w-20">플레이어 {idx + 1}</span>
                                  <input 
                                    type="text" 
                                    value={p.name}
                                    onChange={(e) => updateSetupPlayer(idx, 'name', e.target.value)}
                                    className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    placeholder="이름 입력"
                                  />
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {SELECTABLE_COLORS.map(color => (
                                      <button
                                          key={color}
                                          onClick={() => updateSetupPlayer(idx, 'color', color)}
                                          className={`w-6 h-6 rounded-full border-2 ${color} ${p.color === color ? 'ring-2 ring-offset-2 ring-gray-400 border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                      />
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>

                  <button 
                      onClick={startGame}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors shadow-md transform hover:scale-[1.02]"
                  >
                      게임 시작
                  </button>
              </div>
          </div>
      );
  }

  // Game Over Screen
  if (game.status === 'GAME_OVER') {
      const results = calculateFinalScores();
      return (
          <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-bounce-in">
                  <h1 className="text-3xl md:text-4xl font-jua text-purple-600 mb-6">🏆 게임 종료! 🏆</h1>
                  <div className="space-y-4 mb-8">
                      {results.map((p, idx) => (
                          <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl ${idx === 0 ? 'bg-yellow-100 border-2 border-yellow-400 transform scale-105 shadow-md' : 'bg-gray-50 border border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                  <span className={`font-bold text-xl ${idx === 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                      {idx + 1}위
                                  </span>
                                  <div className={`w-8 h-8 rounded-full shadow-sm ${p.color}`}></div>
                                  <span className="font-bold text-lg">{p.name}</span>
                              </div>
                              <div className="text-right">
                                  <div className="font-bold text-gray-800">{p.score.toLocaleString()} 구름</div>
                                  <div className="text-xs text-gray-500">
                                      (현금: {p.money}, 자산: {p.assetsValue})
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button 
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all"
                  >
                      다시 하기
                  </button>
              </div>
          </div>
      );
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  const currentTile = game.tiles[currentPlayer.position];
  const canBuy = game.turnPhase === 'ACTION' && currentTile.type === TileType.CITY && currentTile.ownerId === null && currentPlayer.money >= currentTile.price;
  const canUpgrade = game.turnPhase === 'ACTION' && currentTile.type === TileType.CITY && currentTile.ownerId === currentPlayer.id && currentTile.buildingLevel < 2 && currentPlayer.money >= Math.floor(currentTile.price * 0.5);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row overflow-hidden max-h-screen">
      {/* Quiz Modal */}
      {game.quizActive && game.currentQuiz && (
        <QuizModal 
          question={game.currentQuiz} 
          onAnswer={handleQuizResult} 
          isLoading={false}
        />
      )}
      {(isQuizLoading) && (
        <QuizModal 
          question={null as any} 
          onAnswer={() => {}} 
          isLoading={true}
        />
      )}

      {/* Main Game Board Area */}
      <div className="flex-1 p-2 md:p-4 flex items-center justify-center overflow-auto">
         {/* 6x6 Grid Container */}
         <div className={`grid grid-cols-6 grid-rows-6 gap-0.5 md:gap-1 w-full max-w-[800px] aspect-square bg-blue-200 p-1 md:p-4 rounded-xl shadow-inner relative transition-all ${game.isSpaceTravelActive ? 'cursor-pointer ring-4 ring-yellow-400 animate-pulse' : ''}`}>
            
            {/* Render Tiles */}
            {game.tiles.map((tile, index) => {
                const owner = tile.ownerId !== null ? game.players[tile.ownerId] : null;
                return (
                    <div key={tile.id} style={getGridStyle(index)} className="w-full h-full">
                        <TileComponent 
                            tile={tile} 
                            playersOnTile={game.players.filter(p => p.position === tile.id)}
                            ownerColor={owner?.color}
                            onClick={handleTileClick}
                        />
                    </div>
                );
            })}

            {/* Center Area (Control Panel) */}
            <div className="col-start-2 col-end-6 row-start-2 row-end-6 bg-white/90 backdrop-blur-sm rounded-xl p-2 md:p-6 flex flex-col items-center justify-center shadow-lg border-2 border-white z-10">
                
                {/* Header Info */}
                <div className="text-center mb-1 md:mb-4 w-full">
                    <h2 className="text-base md:text-3xl font-black text-gray-900 mb-1">Round {game.round} / {game.maxRounds}</h2>
                    <div className="h-1 w-12 md:w-20 bg-blue-500 mx-auto rounded-full"></div>
                </div>

                {/* Message Log */}
                <div className="w-full bg-blue-50/80 rounded-lg p-2 md:p-4 h-20 md:h-28 overflow-y-auto mb-2 md:mb-4 text-center flex items-center justify-center border-2 border-blue-100 shadow-inner">
                    <p className="font-bold text-base md:text-xl text-black animate-fade-in whitespace-pre-line leading-normal">{game.message}</p>
                </div>

                {/* Current Player Status */}
                <div className="flex flex-col items-center mb-2 md:mb-6">
                    <div className="text-[10px] md:text-sm text-gray-800 font-bold mb-1">현재 차례</div>
                    <div className={`px-4 py-1 md:px-6 md:py-2 rounded-full text-white font-extrabold text-base md:text-2xl shadow-md flex items-center gap-2 ${currentPlayer.color.replace('bg-', 'bg-')}`}>
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border border-gray-300"></div>
                        {currentPlayer.name}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 md:gap-4">
                    {game.turnPhase === 'ROLL' && (
                        <button 
                            onClick={rollDice}
                            className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black py-2 px-6 md:py-3 md:px-8 rounded-full text-lg md:text-2xl shadow-lg transform hover:scale-105 transition-all active:scale-95"
                        >
                            🎲 주사위 굴리기
                        </button>
                    )}
                    
                    {/* Dice Display */}
                    {game.turnPhase !== 'ROLL' && (
                       <div className="flex gap-2 md:gap-3 items-center">
                          {game.diceValues.map((val, idx) => (
                            <div key={idx} className={`w-12 h-12 md:w-20 md:h-20 bg-white border-4 ${game.isDouble ? 'border-red-500 text-red-600' : 'border-gray-900 text-black'} rounded-xl flex items-center justify-center text-3xl md:text-5xl font-black shadow-md mb-2 transition-transform duration-75`}>
                                {val}
                            </div>
                          ))}
                       </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 mt-2 md:mt-4 w-full px-1">
                    {/* ACTION PHASE: Decisions (Buy/Upgrade/Pass) */}
                    {game.turnPhase === 'ACTION' && !game.isSpaceTravelActive && (
                        <>
                            {canBuy && (
                                <button onClick={handleBuyCity} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 md:px-6 rounded-lg shadow-md animate-pulse text-sm md:text-lg">
                                    구매 ({currentTile.price})
                                </button>
                            )}
                            {canUpgrade && (
                                <button onClick={handleUpgradeCity} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 md:px-6 rounded-lg shadow-md animate-pulse text-sm md:text-lg">
                                    증축 ({Math.floor(currentTile.price * 0.5)})
                                </button>
                            )}
                            {/* Pass Button: Transitions to END phase */}
                            <button onClick={handlePass} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 md:px-6 rounded-lg shadow-md text-sm md:text-lg">
                                {(canBuy || canUpgrade) ? '패스' : '확인'}
                            </button>
                        </>
                    )}

                    {/* END PHASE: Progression (Next Turn / Roll Again) */}
                    {game.turnPhase === 'END' && (
                        <button onClick={endTurnOrRepeat} className={`text-white font-bold py-2 px-6 md:px-8 rounded-lg shadow-lg text-sm md:text-xl transform hover:scale-105 transition-all ${game.isDouble ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' : 'bg-gray-800 hover:bg-gray-900'}`}>
                            {game.isDouble ? '🎲 더블! 주사위 한 번 더' : '턴 종료'}
                        </button>
                    )}
                </div>

            </div>
         </div>
      </div>

      {/* Sidebar: Player Stats (Compact on mobile) */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-2 md:p-4 shadow-xl overflow-y-auto max-h-[30vh] lg:max-h-full z-20">
          <h3 className="font-jua text-lg md:text-2xl text-gray-900 mb-2 md:mb-4 border-b pb-2 sticky top-0 bg-white z-10">플레이어 현황</h3>
          <div className="space-y-2 md:space-y-4">
              {game.players.map((player) => (
                  <div key={player.id} className={`p-2 md:p-4 rounded-xl border-2 transition-all ${game.currentPlayerIndex === player.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'}`}>
                      <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full ${player.color} border border-black/10`}></div>
                              <span className={`font-extrabold text-sm md:text-lg ${game.currentPlayerIndex === player.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {player.name} {player.isSkipped && '🚫'}
                              </span>
                          </div>
                          <span className="font-mono font-black text-black text-sm md:text-lg">{player.money.toLocaleString()} 구름</span>
                      </div>
                      {/* Changed truncate to break-words to show full list */}
                      <div className="text-[11px] md:text-sm text-gray-800 font-medium break-words pl-6">
                          보유: {player.assets.length > 0 ? player.assets.map(id => BOARD_DATA[id].name).join(', ') : '없음'}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default App;