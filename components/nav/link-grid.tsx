"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/types";
import { X, FolderOpen, GripVertical } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LinkGridProps {
  categories: Category[];
  onReorder: (newCategories: Category[]) => void;
  // 新增：通知父组件打开/关闭状态
  onOpenChange?: (isOpen: boolean) => void;
}

const IconRender = ({ name, className }: { name: string; className?: string }) => {
  // @ts-ignore
  const Icon = (Icons[name as keyof typeof Icons] as LucideIcon) || Icons.Link;
  return <Icon className={className} />;
};

function SortableCategoryCard({ 
  category, 
  onClick,
  activeId
}: { 
  category: Category; 
  onClick: () => void;
  activeId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const glassClass = isDragging 
    ? "bg-zinc-800/90 border-white/30" 
    : "bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 hover:bg-white/15";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group touch-none ${isDragging ? 'opacity-90 scale-105' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/20 text-white/50 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:bg-black/40 transition-opacity"
        onClick={(e) => e.stopPropagation()} 
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div
        onClick={onClick}
        className="cursor-pointer transform-gpu backface-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl active:scale-95 active:translate-y-0"
      >
        <div className={`h-32 w-full rounded-3xl border shadow-lg transition-colors overflow-hidden flex flex-col items-center justify-center gap-2 ${glassClass}`}>
          <div className="p-3 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-inner">
            <FolderOpen className="h-8 w-8 text-yellow-200/90 drop-shadow-md" />
          </div>
          
          <div className="text-center">
            <h3 className="text-white font-medium tracking-wide drop-shadow-sm select-none">{category.title}</h3>
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold block mt-1 select-none">
              {category.links.length} Links
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LinkGrid({ categories, onReorder, onOpenChange }: LinkGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const selectedCategory = categories.find((c) => c.id === selectedId);

  // 监听打开状态，同步给父组件
  useEffect(() => {
    onOpenChange?.(!!selectedId);
  }, [selectedId, onOpenChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      onReorder(arrayMove(categories, oldIndex, newIndex));
    }
  };

  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedId]);

  return (
    <>
      <div className={`transition-opacity duration-300 ${selectedId ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={categories.map(c => c.id)} 
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto pb-20 px-6 relative z-30">
              {categories.map((category) => (
                <SortableCategoryCard
                  key={category.id}
                  category={category}
                  activeId={activeDragId}
                  onClick={() => setSelectedId(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <AnimatePresence>
        {selectedId && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* 文件夹内容窗口 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              // 关键优化：will-change-transform 提示浏览器优化
              className="w-full max-w-4xl max-h-[85vh] bg-zinc-900/80 dark:bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative z-10 will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-200">
                     <FolderOpen className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {selectedCategory.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 text-blue-200">
                           <IconRender name={link.icon || "Link"} className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm truncate group-hover:text-blue-200 transition-colors">
                            {link.title}
                          </h4>
                          {link.description ? (
                            <p className="text-white/40 text-xs truncate mt-0.5">{link.description}</p>
                          ) : (
                            <p className="text-white/30 text-[10px] truncate mt-0.5 font-mono">{new URL(link.url).hostname}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}