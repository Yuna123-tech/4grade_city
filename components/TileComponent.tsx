import React from 'react';
import { Tile, TileType, Player, PLAYER_COLORS } from '../types';

interface TileComponentProps {
  tile: Tile;
  playersOnTile: Player[];
  ownerColor?: string; // Color of the owner (e.g., 'bg-red-500')
  onClick: (tile: Tile) => void;
}

const TileComponent: React.FC<TileComponentProps> = ({ tile, playersOnTile, ownerColor, onClick }) => {
  let containerClasses = 'bg-white border-gray-300';
  let iconDisplay = tile.icon || '';
  
  // Determine styling based on type and ownership
  if (tile.type === TileType.CITY) {
      if (tile.ownerId !== null) {
          const colorBase = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length]; 
          const colorName = colorBase.replace('bg-', '').replace('-500', '');
          const bgClass = `bg-${colorName}-100`;
          const borderClass = `border-${colorName}-600`;
          containerClasses = `${bgClass} ${borderClass} border-2 md:border-4`; 
      } else {
          containerClasses = 'bg-blue-50 border-blue-400';
      }
  } else if (tile.type === TileType.START) {
      containerClasses = 'bg-red-50 border-red-500';
  } else if (tile.type === TileType.QUIZ) {
      containerClasses = 'bg-yellow-50 border-yellow-500';
  } else if (tile.type === TileType.PARK) {
      containerClasses = 'bg-green-50 border-green-500';
  } else if (tile.type === TileType.DONATION) {
      containerClasses = 'bg-gray-100 border-gray-500';
  } else if (tile.type === TileType.EVENT) {
      containerClasses = 'bg-purple-50 border-purple-500';
  }

  const renderOwnerBadge = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    const badgeColor = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length];
    return (
      <div className={`absolute top-0 left-0 px-1 py-0.5 md:px-2 md:py-1 rounded-br-lg text-[7px] md:text-xs font-black text-white shadow-sm z-10 ${badgeColor} border-r border-b border-white/20`}>
        P{tile.ownerId + 1}
      </div>
    );
  };

  const renderBuildingIndicator = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    let indicator = null;
    if (tile.buildingLevel === 1) {
        indicator = <span className="text-sm md:text-2xl filter drop-shadow-md">🏠</span>;
    } else if (tile.buildingLevel === 2) {
        indicator = <span className="text-base md:text-3xl filter drop-shadow-md">🏢</span>;
    }

    if (!indicator) return null;

    return (
       <div className="absolute top-0 right-0 p-0.5 z-10">
          {indicator}
       </div>
    );
  };

  const renderBuildingStars = () => {
      if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
      
      const stars = [];
      for(let i=0; i<tile.buildingLevel; i++) {
          stars.push(<span key={i}>⭐</span>);
      }
      
      if (stars.length === 0) {
        return <span className="text-[8px] md:text-xs font-extrabold text-slate-700 bg-white/50 px-1 rounded whitespace-nowrap">토지</span>;
      }
      return <div className="flex gap-0.5 text-[8px] md:text-xs">{stars}</div>;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-between p-0.5 md:p-1 w-full h-full border rounded-md md:rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer select-none overflow-hidden ${containerClasses}`}
      onClick={() => onClick(tile)}
    >
      {renderOwnerBadge()}
      {renderBuildingIndicator()}

      {/* Header: Name */}
      {/* Optimized for mobile: smaller text, tighter leading, explicit breaking */}
      <div className={`w-full text-center text-[8px] sm:text-[10px] md:text-base font-black px-0.5 tracking-tight text-black drop-shadow-sm break-words leading-3 md:leading-tight ${tile.ownerId !== null ? 'mt-3 md:mt-5' : 'mt-0.5'}`}>
        {tile.name}
      </div>

      {/* Center: Icon & Status */}
      <div className="flex flex-col items-center justify-center flex-1 w-full overflow-hidden my-0.5">
        <span className="text-lg sm:text-xl md:text-5xl drop-shadow-md transform hover:scale-110 transition-transform duration-200">
            {iconDisplay}
        </span>
        
        <div className="mt-0.5 md:mt-2 flex flex-col items-center justify-center min-h-[14px] md:min-h-[20px] w-full px-0.5">
             {tile.type === TileType.CITY ? (
                 tile.ownerId !== null ? renderBuildingStars() : <span className="text-black font-extrabold text-[9px] md:text-sm bg-white/60 px-1 rounded-full shadow-sm tracking-tighter">{tile.price}</span>
             ) : (
                 <span className="hidden sm:block text-[7px] sm:text-[9px] md:text-xs text-gray-900 font-bold text-center leading-3 break-words px-0.5 bg-white/40 rounded w-full">
                     {tile.description}
                 </span>
             )}
        </div>
      </div>

      {/* Footer: Players present */}
      <div className="flex flex-wrap justify-center gap-0.5 md:gap-1.5 w-full min-h-[10px] md:min-h-[30px] items-end pb-0.5 px-0.5">
        {playersOnTile.map(p => (
          <div 
            key={p.id} 
            className={`w-2 h-2 sm:w-3 sm:h-3 md:w-6 md:h-6 rounded-full border border-white shadow-lg ${p.color} transform transition-all duration-300 z-20 ring-1 ring-black/20`} 
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TileComponent;