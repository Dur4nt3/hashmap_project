export class HashSet {
    #capacity = 16;
    #loadFactor = 0.8;
    #entriesCount = 0;

    constructor() {
        this.buckets = Array.from({ length: 16 }).map(() => []);
    }

    // Hashing function, similar to Java's 'hashCode' function
    static hashCode(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i += 1) {
            hash = (hash << 5) - hash + string.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Return the index of the bucket where a specified key should be stored
    #getBucket(hash) {
        return hash % this.#capacity;
    }

    // Returns true if the next inserted element will exceed the maximum load (capacity * loadFactor)
    #growthRequired() {
        return this.#entriesCount + 1 > this.#capacity * this.#loadFactor;
    }

    // Double the capacity and migrate all keys
    #growBuckets() {
        // Number of buckets starts at 2^4 and doubles every growth cycle
        // Find the previous exponent (log base 2 of capacity) and increment it
        const newExponent =
            Math.floor(Math.log(this.#capacity) / Math.log(2)) + 1;

        // Update capacity tracker
        this.#capacity = 2 ** newExponent;

        const tempBuckets = Array.from({ length: this.#capacity }).map(
            () => [],
        );

        // Update the temporary bucket
        for (const bucket of this.buckets) {
            for (const key of bucket) {
                const newBucket = this.#getBucket(HashSet.hashCode(key));
                tempBuckets[newBucket].push(key);
            }
        }

        // Update buckets
        this.buckets = tempBuckets.slice();
    }

    // Returns the index of the key within a specified bucket
    // Returns null if the key doesn't exist
    #getElementIndex(bucketIndex, key) {
        const bucket = this.buckets[bucketIndex];
        for (const index in bucket) {
            if (bucket[index] === key) {
                return Number(index);
            }
        }
        return null;
    }

    // Return the hash of the key, the bucket index matching the hash, and the index of the key within the bucket if it already exists
    #getKeyInfo(key) {
        const hash = HashSet.hashCode(key);
        const bucketIndex = this.#getBucket(hash);
        const elementIndex = this.#getElementIndex(bucketIndex, key);

        return { hash, bucketIndex, elementIndex };
    }

    set(key) {
        const { bucketIndex, elementIndex } = this.#getKeyInfo(key);

        if (elementIndex !== null) {
            this.buckets[bucketIndex][elementIndex] = key;
        } else {
            if (this.#growthRequired()) {
                this.#growBuckets();
            }
            this.buckets[bucketIndex].push(key);
            this.#entriesCount += 1;
        }
    }

    has(key) {
        const { elementIndex } = this.#getKeyInfo(key);
        return elementIndex !== null;
    }

    remove(key) {
        const { bucketIndex, elementIndex } = this.#getKeyInfo(key);

        if (elementIndex !== null) {
            this.buckets[bucketIndex].splice(elementIndex, 1);
            this.#entriesCount -= 1;
            return true;
        }
        return false;
    }

    length() {
        return this.#entriesCount;
    }

    // Clear all keys and reset to default minimum capacity
    clear() {
        this.buckets = Array.from({ length: 16 }).map(() => []);
        this.#capacity = 16;
        this.#entriesCount = 0;
    }

    // Returns all keys
    entries() {
        const entriesArray = [];
        for (const bucket of this.buckets) {
            for (const key of bucket) {
                entriesArray.push(key);
            }
        }

        return entriesArray;
    }
}
