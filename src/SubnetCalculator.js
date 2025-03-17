import { useState } from "react";

const SubnetCalculator = () => {
    const [ip, setIp] = useState("8.8.8.8");
    const [subnet, setSubnet] = useState("30");
    const [result, setResult] = useState(null);

    const subnetOptions = [
        "255.255.255.252 /30", "255.255.255.248 /29", "255.255.255.240 /28",
        "255.255.255.224 /27", "255.255.255.192 /26", "255.255.255.128 /25",
        "255.255.255.0 /24", "255.255.254.0 /23", "255.255.252.0 /22",
        "255.255.248.0 /21", "255.255.240.0 /20", "255.255.224.0 /19",
        "255.255.192.0 /18", "255.255.128.0 /17", "255.255.0.0 /16",
        "255.254.0.0 /15", "255.252.0.0 /14", "255.248.0.0 /13",
        "255.240.0.0 /12", "255.224.0.0 /11", "255.192.0.0 /10", "255.128.0.0 /9",
        "255.0.0.0 /8", "254.0.0.0 /7", "252.0.0.0 /6", "248.0.0.0 /5",
        "240.0.0.0 /4", "224.0.0.0 /3", "192.0.0.0 /2", "128.0.0.0 /1"
    ];

    const calculateSubnet = () => {
        const subnetMask = subnet.split("/")[1];
        const networkData = getSubnetInfo(ip, parseInt(subnetMask));
        setResult(networkData);
    };

    return (
        <div className="p-6 bg-gray-900 min-h-screen flex flex-col items-center text-white">
            <h1 className="text-2xl font-bold mb-4">Subnet Calculator</h1>
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="IP Address (eg. 8.8.8.8)"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="p-2 rounded text-black"
                />
                <select
                    value={subnet}
                    onChange={(e) => setSubnet(e.target.value)}
                    className="p-2 rounded text-black"
                >
                    {subnetOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
                <button onClick={calculateSubnet} className="p-2 bg-blue-500 rounded">Calculate</button>
            </div>
            {result && (
                <table className="border border-gray-600 w-full max-w-lg text-left">
                    <tbody>
                        {Object.entries(result).map(([key, value]) => (
                            <tr key={key} className="border-b border-gray-600">
                                <td className="p-2 font-bold">{key}:</td>
                                <td className="p-2">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const getSubnetInfo = (ip, cidr) => {
    const ipParts = ip.split(".").map(Number);
    const subnetMask = (0xffffffff << (32 - cidr)) >>> 0;
    const maskParts = [(subnetMask >>> 24) & 255, (subnetMask >>> 16) & 255, (subnetMask >>> 8) & 255, subnetMask & 255];
    const wildcardParts = maskParts.map(part => 255 - part);

    const ipBinary = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const networkBinary = ipBinary & subnetMask;
    const broadcastBinary = networkBinary | ~subnetMask;

    const networkAddress = [(networkBinary >>> 24) & 255, (networkBinary >>> 16) & 255, (networkBinary >>> 8) & 255, networkBinary & 255].join(".");
    const broadcastAddress = [(broadcastBinary >>> 24) & 255, (broadcastBinary >>> 16) & 255, (broadcastBinary >>> 8) & 255, broadcastBinary & 255].join(".");

    const firstUsable = cidr < 31 ? networkBinary + 1 : networkBinary;
    const lastUsable = cidr < 31 ? broadcastBinary - 1 : broadcastBinary;
    const usableHostRange = `${[(firstUsable >>> 24) & 255, (firstUsable >>> 16) & 255, (firstUsable >>> 8) & 255, firstUsable & 255].join(".")} - ${[(lastUsable >>> 24) & 255, (lastUsable >>> 16) & 255, (lastUsable >>> 8) & 255, lastUsable & 255].join(".")}`;

    const getIpType = (ipParts) => {
        const [first, second] = ipParts;
        if (first === 10) return "Private";
        if (first === 172 && second >= 16 && second <= 31) return "Private";
        if (first === 192 && second === 168) return "Private";
        return "Public";
    };

    return {
        "IP Address": ip,
        "Network Address": networkAddress,
        "Usable Host IP Range": usableHostRange,
        "Broadcast Address": broadcastAddress,
        "Total Number of Hosts": 2 ** (32 - cidr),
        "Number of Usable Hosts": cidr < 31 ? (2 ** (32 - cidr)) - 2 : 0,
        "Subnet Mask": maskParts.join("."),
        "Wildcard Mask": wildcardParts.join("."),
        "Binary Subnet Mask": maskParts.map(part => part.toString(2).padStart(8, '0')).join("."),
        "IP Class": getClass(ipParts[0]),
        "CIDR Notation": `/${cidr}`,
        "IP Type": getIpType(ipParts),
    };
};

const getClass = (firstOctet) => {
    if (firstOctet < 128) return "A";
    if (firstOctet < 192) return "B";
    if (firstOctet < 224) return "C";
    return "D or E";
};

export default SubnetCalculator;