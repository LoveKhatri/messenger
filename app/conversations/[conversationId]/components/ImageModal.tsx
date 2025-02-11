'use client';

import { Modal } from "@/app/components/Modal";
import Image from "next/image";

interface ImageModalProps {
    src?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose, isOpen }) => {
    if (!src) {
        return null;
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="w-80 h-80">
                    <Image src={src} alt="Image" className="object-cover" fill />
                </div>
            </Modal>
        </>
    )

}

export default ImageModal