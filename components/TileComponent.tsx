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
          // Owner specific styles
          // Use provided ownerColor or fallback to default array based on index
          const colorBase = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length]; 
          
          // Extract color name (e.g., 'red', 'blue') assuming format 'bg-COLOR-500'
          const colorName = colorBase.replace('bg-', '').replace('-500', '');
          
          const bgClass = `bg-${colorName}-100`;
          const borderClass = `border-${colorName}-500`;
          
          // Thicker border for owned properties
          containerClasses = `${bgClass} ${borderClass} border-4`; 
      } else {
          containerClasses = 'bg-blue-50 border-blue-300';
      }
  } else if (tile.type === TileType.START) {
      containerClasses = 'bg-red-100 border-red-400';
  } else if (tile.type === TileType.QUIZ) {
      containerClasses = 'bg-yellow-100 border-yellow-400';
  } else if (tile.type === TileType.PARK) {
      containerClasses = 'bg-green-100 border-green-400';
  } else if (tile.type === TileType.DONATION) {
      containerClasses = 'bg-gray-100 border-gray-400';
  } else if (tile.type === TileType.EVENT) {
      containerClasses = 'bg-purple-100 border-purple-400';
  }

  const renderOwnerBadge = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    const badgeColor = ownerColor || PLAYER_COLORS[tile.ownerId % PLAYER_COLORS.length];
    return (
      <div className={`absolute top-0 left-0 px-2 py-0.5 rounded-br-lg text-[10px] font-bold text-white shadow-sm z-10 ${badgeColor}`}>
        P{tile.ownerId + 1}
      </div>
    );
  };

  const renderBuildingIndicator = () => {
    if (tile.type !== TileType.CITY || tile.ownerId === null) return null;
    
    let indicator = null;
    if (tile.buildingLevel === 1) {
        // House
        indicator = <span className="text-xl filter drop-shadow-md">🏠</span>;
    } else if (tile.buildingLevel === 2) {
        // Building
        indicator = <span className="text-2xl filter drop-shadow-md">🏢</span>;
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
        // Level 0 (Land Only)
        return <span className="text-[10px] font-bold text-gray-500 opacity-80">토지</span>;
      }
      return <div className="flex gap-0.5 text-xs">{stars}</div>;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-between p-0.5 md:p-1 w-full h-full border-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${containerClasses}`}
      onClick={() => onClick(tile)}
    >
      {renderOwnerBadge()}
      {renderBuildingIndicator()}

      {/* Header: Name */}
      <div className={`w-full text-center text-xs md:text-sm font-bold truncate px-0.5 tracking-tight ${tile.ownerId !== null ? 'mt-4' : ''}`}>
        {tile.name}
      </div>

      {/* Center: Icon & Status */}
      <div className="flex flex-col items-center justify-center flex-1 w-full overflow-hidden">
        <span className="text-3xl md:text-5xl drop-shadow-sm transform hover:scale-110 transition-transform duration-200">
            {iconDisplay}
        </span>
        
        <div className="mt-1 flex flex-col items-center justify-center min-h-[16px]">
             {tile.type === TileType.CITY ? (
                 tile.ownerId !== null ? renderBuildingStars() : <span className="text-gray-500 font-medium text-[10px] md:text-xs">{tile.price}구름</span>
             ) : (
                 <span className="hidden md:block text-[10px] text-gray-500 text-center leading-tight overflow-hidden px-1">
                     {tile.description}
                 </span>
             )}
        </div>
      </div>

      {/* Footer: Players present */}
      <div className="flex flex-wrap justify-center gap-1 w-full min-h-[20px] md:min-h-[28px] items-end pb-0.5 px-0.5">
        {playersOnTile.map(p => (
          <div 
            key={p.id} 
            className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white shadow-md ${p.color} transform transition-all duration-300 z-20 ring-1 ring-black/10`} 
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
};

export default TileComponent;