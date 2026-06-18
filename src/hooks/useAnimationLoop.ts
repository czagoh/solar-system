import { useEffect, useRef } from "react";

export function useAnimationLoop(draw: () => void) {
    const animRef = useRef<number>(0)
    const drawRef = useRef(draw)

    useEffect(() => {
        drawRef.current = draw
    })

    useEffect(() => {
        const loop = () => {
            drawRef.current()
            animRef.current = requestAnimationFrame(loop)
        }
        animRef.current = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(animRef.current)
    })
}