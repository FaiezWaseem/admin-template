"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Write something amazing..." }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-md shadow-sm max-w-full h-auto my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-muted-foreground before:opacity-50 before:pointer-events-none'
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] max-w-none px-4 py-3',
            },
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) { return; }
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Image URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return <div className="min-h-[300px] border rounded-md flex items-center justify-center text-muted-foreground">Loading editor...</div>;
    }

    return (
        <div className="border rounded-md bg-card overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={cn("h-8 w-8 p-0", editor.isActive('bold') && "bg-muted")}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("h-8 w-8 p-0", editor.isActive('italic') && "bg-muted")}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("h-8 w-8 p-0", editor.isActive('strike') && "bg-muted")}>
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 1 }) && "bg-muted")}>
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("h-8 w-8 p-0", editor.isActive('heading', { level: 2 }) && "bg-muted")}>
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("h-8 w-8 p-0", editor.isActive('bulletList') && "bg-muted")}>
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("h-8 w-8 p-0", editor.isActive('orderedList') && "bg-muted")}>
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("h-8 w-8 p-0", editor.isActive('blockquote') && "bg-muted")}>
                    <Quote className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-border mx-1" />

                <Button type="button" variant="ghost" size="sm" onClick={setLink} className={cn("h-8 w-8 p-0", editor.isActive('link') && "bg-muted")}>
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <div className="flex-1" />

                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0">
                    <Undo className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0">
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto cursor-text" onClick={() => editor.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
