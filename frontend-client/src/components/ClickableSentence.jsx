import React from "react";

export default function ClickableSentence({ text, onWordClick }) {
  if (!text) return null;

  // Regex tách chuỗi thành các phần: Từ (bao gồm cả dấu nháy đơn như don't) và Ký tự khác (dấu câu, khoảng trắng)
  const parts = text.split(/(\b[a-zA-Z']+\b)/g);

  return (
    <span>
      {parts.map((part, index) => {
        // Kiểm tra xem part có phải là một từ hợp lệ không
        if (/^[a-zA-Z']+$/.test(part)) {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation(); // Ngăn click nhầm vào các component cha
                if (onWordClick) {
                  onWordClick(part, e);
                }
              }}
              className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm rounded transition-all duration-200"
            >
              {part}
            </span>
          );
        }
        // Trả về dấu câu hoặc khoảng trắng bình thường
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
