
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
          // Extract color name safely
          const colorName = colorBase.replace('bg-', '').replace('-500', '');
          const bgClass = `bg-${colorName}-100`;
          const borderClass = `border-${colorName}-600`;
          containerClasses = `${bgClass} ${borderClass} border-[1.5px] md:border-4`; 
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
      <div className={`absolute top-0 left-0 px-0.5 rounded-br text-[5px] md:text-xs font-black text-white shadow-sm z-20 ${badgeColor} border-r border-b border-white/20 leading-none py-0.5 pointer-events-none`}>
        P{tile.ownerId + 1}
      </div>
    );
  };

  const renderBuildingIndicator = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    let indicator = null;
    if (tile.buildingLevel === 1) {
        indicator = <span className="text-[8px] md:text-2xl filter drop-shadow-md">🏠</span>;
    } else if (tile.buildingLevel === 2) {
        indicator = <span className="text-[10px] md:text-3xl filter drop-shadow-md">🏢</span>;
    }

    if (!indicator) return null;

    return (
       <div className="absolute top-0 right-0 p-0.5 z-20 leading-none pointer-events-none">
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
        return <span className="text-[6px] md:text-xs font-extrabold text-slate-700 bg-white/50 px-0.5 rounded whitespace-nowrap">토지</span>;
      }
      return <div className="flex gap-px text-[6px] md:text-xs justify-center">{stars}</div>;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-between p-[1px] md:p-1 w-full h-full border rounded md:rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer select-none overflow-hidden ${containerClasses}`}
      onClick={() => onClick(tile)}
    >
      {renderOwnerBadge()}
      {renderBuildingIndicator()}

      {/* 
         LAYOUT STRATEGY: 
         - Name: flex-shrink-0 (Never shrink)
         - Icon: flex-1 (Shrink if needed)
         - Price/Players: flex-shrink-0 (Never shrink)
      */}

      {/* Header: Name */}
      <div className="flex-shrink-0 w-full text-center pt-1 md:pt-1 z-10 px-px">
         <div className="text-[7px] md:text-base font-black tracking-tight text-black drop-shadow-none break-words whitespace-normal leading-[9px] md:leading-tight">
            {tile.name}
         </div>
      </div>

      {/* Center: Icon (Shrinkable) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-hidden relative z-0">
        <span className="text-sm sm:text-xl md:text-5xl drop-shadow-md leading-none py-0.5">
            {iconDisplay}
        </span>
      </div>
      
      {/* Footer Info: Price or Desc */}
      <div className="flex-shrink-0 w-full flex flex-col items-center justify-center px-px pb-0.5 z-10">
           {tile.type === TileType.CITY ? (
               tile.ownerId !== null ? renderBuildingStars() : <span className="text-black font-extrabold text-[7px] md:text-sm bg-white/60 px-0.5 rounded-full shadow-sm tracking-tighter leading-none">{tile.price}</span>
           ) : (
               <span className="block text-[6px] sm:text-[8px] md:text-xs text-gray-900 font-bold text-center leading-tight break-words px-px bg-white/40 rounded w-full line-clamp-2 md:line-clamp-none">
                   {tile.description}
               </span>
           )}
      </div>

      {/* Footer: Players present */}
      <div className="flex-shrink-0 flex flex-wrap justify-center gap-[1px] md:gap-1.5 w-full min-h-[4px] md:min-h-[24px] items-end pb-0.5 px-px z-10">
        {playersOnTile.map(p => (
          <div 
            key={p.id} 
            className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-5 md:h-5 rounded-full border border-white shadow-lg ${p.color} ring-[0.5px] ring-black/20`} 
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TileComponent;
