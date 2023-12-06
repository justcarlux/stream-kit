import os from "node:os";

export default function getPrivateAddress() {
    const interfaces = os.networkInterfaces();
    return Object.keys(interfaces)
    .map(key => {
        return interfaces[key]?.map(e => {
            if (
                e.address.startsWith("192.168.1") ||
                e.address.startsWith("192.168.0.1")
            ) {
                return e.address;
            }
            return null;
        })
    })
    .reduce(
        (previous, current) => previous?.concat(current as any[]), []
    )
    ?.find(e => e);
}