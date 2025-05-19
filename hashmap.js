export class HashMap {
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

    // Return the index of the bucket where a specified { key: value } pair should be stored
    #getBucket(hash) {
        return hash % this.#capacity;
    }

    // Returns true if the next inserted element will exceed the maximum load (capacity * loadFactor)
    #growthRequired() {
        return this.#entriesCount + 1 > this.#capacity * this.#loadFactor;
    }

    // Double the capacity and migrate all { key: value } pairs
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
            for (const element of bucket) {
                const newBucket = this.#getBucket(
                    HashMap.hashCode(element.key),
                );
                tempBuckets[newBucket].push(element);
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
            if (bucket[index].key === key) {
                return Number(index);
            }
        }
        return null;
    }

    // Return the hash of the key, the bucket index matching the hash, and the index of the key within the bucket if it already exists
    #getKeyInfo(key) {
        const hash = HashMap.hashCode(key);
        const bucketIndex = this.#getBucket(hash);
        const elementIndex = this.#getElementIndex(bucketIndex, key);

        return { hash, bucketIndex, elementIndex };
    }

    set(key, value) {
        const { bucketIndex, elementIndex } = this.#getKeyInfo(key);

        if (elementIndex !== null) {
            this.buckets[bucketIndex][elementIndex].value = value;
        } else {
            if (this.#growthRequired()) {
                this.#growBuckets();
            }
            this.buckets[bucketIndex].push({ key, value });
            this.#entriesCount += 1;
        }
    }

    get(key) {
        const { bucketIndex, elementIndex } = this.#getKeyInfo(key);

        return elementIndex !== null
            ? this.buckets[bucketIndex][elementIndex].value
            : elementIndex;
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

    // Clear all { key: value } pairs and reset to default minimum capacity
    clear() {
        this.buckets = Array.from({ length: 16 }).map(() => []);
        this.#capacity = 16;
        this.#entriesCount = 0;
    }

    keys() {
        const keysArray = [];
        for (const bucket of this.buckets) {
            for (const element of bucket) {
                keysArray.push(element.key);
            }
        }

        return keysArray;
    }

    values() {
        const valuesArray = [];
        for (const bucket of this.buckets) {
            for (const element of bucket) {
                valuesArray.push(element.value);
            }
        }

        return valuesArray;
    }

    // Returns all { key: value } pairs
    entries() {
        const entriesArray = [];
        for (const bucket of this.buckets) {
            for (const element of bucket) {
                entriesArray.push([element.key, element.value]);
            }
        }

        return entriesArray;
    }
}
