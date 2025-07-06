"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { uploadImage } from "../../lib/uploadImage";
import { useCallback, useEffect, useState } from "react";
import "../styles/tiptap.css";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const [headings, setHeadings] = useState<string[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: "ProseMirror px-4 py-3 focus:outline-none",
      },
      // Allow drag-and-drop image uploading
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/")) {
          (async () => {
            const url = await uploadImage(file);
            editor?.chain().focus().setImage({ src: url }).run();
          })();
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);

      // Extract H2 headings to generate a mini table of contents
      const matches = Array.from(html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi));
      const newHeadings = matches.map(
        (match, i) =>
          `Section ${i + 1}: ${match[1].replace(/(<([^>]+)>)/gi, "")}`
      );
      setHeadings(newHeadings);
    },
  });

  // Sync externally updated content into the editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Triggers native file picker for image upload
  const insertImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files?.length) return;
      const file = input.files[0];
      const url = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  // Utility to style toolbar buttons consistently
  const buttonClass = (active = false) =>
    `px-2 py-1 text-sm rounded border transition ${
      active
        ? "bg-purple-600 text-white border-purple-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
    }`;

  return (
    <div className="rounded-md border shadow-sm">
      {/* Toolbar: visible at top of editor */}
      <div className="sticky top-20 z-10 flex flex-wrap gap-1 items-center p-3 bg-white border-b shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={buttonClass()}
        >
          ↩️ Angre
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={buttonClass()}
        >
          ↪️ Gjør om
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={buttonClass(editor.isActive("blockquote"))}
        >
          “ ” Quote
        </button>
        <button type="button" onClick={insertImage} className={buttonClass()}>
          📷 Bilde
        </button>
      </div>

      {/* Editable content area */}
      <EditorContent editor={editor} />

      {/* Table of contents generated from headings */}
      {headings.length > 0 && (
        <div className="p-4 border-t bg-white">
          <h3 className="text-sm font-semibold mb-2">📑 Innhold</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {headings.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
