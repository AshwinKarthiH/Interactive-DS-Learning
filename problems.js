    globalThis.AlgoProblems = [
        {
            id: 'two-sum',
            number: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            acceptance: '53.2%',
            tags: ['LeetCode #1', 'Arrays', 'Hash Map'],
            description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.<br><br>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.`,
            examples: [
                {
                    input: 'nums = [2, 7, 11, 15], target = 9',
                    output: '[0, 1]',
                    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                    input: 'nums = [3, 2, 4], target = 6',
                    output: '[1, 2]',
                    explanation: 'nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].'
                },
                {
                    input: 'nums = [3, 3], target = 6',
                    output: '[0, 1]',
                    explanation: 'nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].'
                }
            ],
            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists.',
                'Follow-up: Can you come up with an algorithm that is less than O(n²) time complexity?'
            ],
            hint: 'Use a Hash Map to store numbers you have already visited and their indices: map.set(nums[i], i). For each number, check if (target - nums[i]) already exists in the map.',
            jsStarter: `/**
 * LeetCode #1: Two Sum
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
            pyStarter: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []`,
            javaStarter: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
            cStarter: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i;
                res[1] = j;
                return res;
            }
        }
    }
    return res;
}`,
            testCases: [
                { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', run: (fn) => fn([2, 7, 11, 15], 9) },
                { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', run: (fn) => fn([3, 2, 4], 6) },
                { input: 'nums = [3, 3], target = 6', expected: '[0, 1]', run: (fn) => fn([3, 3], 6) }
            ]
        },
        {
            id: 'reverse-linked-list',
            number: 206,
            title: 'Reverse a Linked List',
            difficulty: 'Easy',
            acceptance: '76.8%',
            tags: ['LeetCode #206', 'Linked List', 'Pointers'],
            description: `Given the head of a singly linked list represented as an array of values, reverse the list, and return <em>the reversed array of values</em>.`,
            examples: [
                {
                    input: 'head = [1, 2, 3, 4, 5]',
                    output: '[5, 4, 3, 2, 1]',
                    explanation: 'Reversing list 1->2->3->4->5 produces 5->4->3->2->1.'
                },
                {
                    input: 'head = [1, 2]',
                    output: '[2, 1]',
                    explanation: 'Reversing 1->2 produces 2->1.'
                }
            ],
            constraints: [
                'The number of nodes in the list is the range [0, 5000].',
                '-5000 <= Node.val <= 5000'
            ],
            hint: 'Use three pointers (prev = null, curr = head, next) or iteratively reverse the links in a single pass!',
            jsStarter: `/**
 * LeetCode #206: Reverse Linked List
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
    const reversed = [];
    for (let i = head.length - 1; i >= 0; i--) {
        reversed.push(head[i]);
    }
    return reversed;
}`,
            pyStarter: `class Solution:
    def reverseList(self, head: list[int]) -> list[int]:
        return head[::-1]`,
            javaStarter: `class Solution {
    public int[] reverseList(int[] head) {
        int[] res = new int[head.length];
        for (int i = 0; i < head.length; i++) {
            res[i] = head[head.length - 1 - i];
        }
        return res;
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        vector<int> res(head.rbegin(), head.rend());
        return res;
    }
};`,
            cStarter: `int* reverseList(int* head, int headSize, int* returnSize) {
    *returnSize = headSize;
    int* res = (int*)malloc(headSize * sizeof(int));
    for (int i = 0; i < headSize; i++) {
        res[i] = head[headSize - 1 - i];
    }
    return res;
}`,
            testCases: [
                { input: 'head = [1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]', run: (fn) => fn([1, 2, 3, 4, 5]) },
                { input: 'head = [1, 2]', expected: '[2, 1]', run: (fn) => fn([1, 2]) },
                { input: 'head = []', expected: '[]', run: (fn) => fn([]) }
            ]
        },
        {
            id: 'valid-parentheses',
            number: 20,
            title: 'Valid Parentheses',
            difficulty: 'Easy',
            acceptance: '41.1%',
            tags: ['LeetCode #20', 'Stack', 'String'],
            description: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br><br>An input string is valid if open brackets are closed by the same type of brackets in the correct order.`,
            examples: [
                { input: 's = "()"', output: 'true', explanation: 'Matching pair of parentheses.' },
                { input: 's = "()[]{}"', output: 'true', explanation: 'All three pairs match in proper order.' },
                { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
            ],
            constraints: [
                '1 <= s.length <= 10^4',
                's consists of parentheses only "()[]{}"'
            ],
            hint: 'Use a Stack! When encountering an opening bracket, push it. When encountering a closing bracket, check if it matches the top of the stack.',
            jsStarter: `/**
 * LeetCode #20: Valid Parentheses
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.pop() !== pairs[char]) return false;
        }
    }
    return stack.length === 0;
}`,
            pyStarter: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for c in s:
            if c in '({[':
                stack.append(c)
            elif not stack or stack.pop() != pairs[c]:
                return False
        return len(stack) == 0`,
            javaStarter: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
            cppStarter: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.empty() || st.top() != c) return false;
            else st.pop();
        }
        return st.empty();
    }
};`,
            cStarter: `bool isValid(char* s) {
    int len = strlen(s);
    char stack[10005];
    int top = -1;
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char open = stack[top--];
            if (c == ')' && open != '(') return false;
            if (c == '}' && open != '{') return false;
            if (c == ']' && open != '[') return false;
        }
    }
    return top == -1;
}`,
            testCases: [
                { input: 's = "()"', expected: 'true', run: (fn) => fn("()") },
                { input: 's = "()[]{}"', expected: 'true', run: (fn) => fn("()[]{}") },
                { input: 's = "(]"', expected: 'false', run: (fn) => fn("(]") }
            ]
        },
        {
            id: 'merge-sorted-lists',
            number: 21,
            title: 'Merge Two Sorted Lists',
            difficulty: 'Easy',
            acceptance: '64.2%',
            tags: ['LeetCode #21', 'Linked List', 'Recursion'],
            description: `You are given the heads of two sorted linked lists represented as arrays <code>list1</code> and <code>list2</code>.<br><br>Merge the two lists into one <strong>sorted</strong> list and return it.`,
            examples: [
                { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]', explanation: 'Elements merged in ascending order.' },
                { input: 'list1 = [], list2 = []', output: '[]', explanation: 'Both lists are empty.' }
            ],
            constraints: [
                'The number of nodes in both lists is in the range [0, 50].',
                '-100 <= Node.val <= 100',
                'Both list1 and list2 are sorted in non-decreasing order.'
            ],
            hint: 'Use two pointers comparing list1[i] and list2[j], appending the smaller element to your result.',
            jsStarter: `/**
 * LeetCode #21: Merge Two Sorted Lists
 * @param {number[]} list1
 * @param {number[]} list2
 * @return {number[]}
 */
function mergeTwoLists(list1, list2) {
    const res = [];
    let i = 0, j = 0;
    while (i < list1.length && j < list2.length) {
        if (list1[i] <= list2[j]) res.push(list1[i++]);
        else res.push(list2[j++]);
    }
    while (i < list1.length) res.push(list1[i++]);
    while (j < list2.length) res.push(list2[j++]);
    return res;
}`,
            pyStarter: `class Solution:
    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:
        return sorted(list1 + list2)`,
            javaStarter: `class Solution {
    public int[] mergeTwoLists(int[] list1, int[] list2) {
        int[] res = new int[list1.length + list2.length];
        int i = 0, j = 0, k = 0;
        while (i < list1.length && j < list2.length) {
            if (list1[i] <= list2[j]) res[k++] = list1[i++];
            else res[k++] = list2[j++];
        }
        while (i < list1.length) res[k++] = list1[i++];
        while (j < list2.length) res[k++] = list2[j++];
        return res;
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {
        vector<int> res;
        int i = 0, j = 0;
        while (i < list1.size() && j < list2.size()) {
            if (list1[i] <= list2[j]) res.push_back(list1[i++]);
            else res.push_back(list2[j++]);
        }
        while (i < list1.size()) res.push_back(list1[i++]);
        while (j < list2.size()) res.push_back(list2[j++]);
        return res;
    }
};`,
            cStarter: `int* mergeTwoLists(int* l1, int l1Size, int* l2, int l2Size, int* returnSize) {
    *returnSize = l1Size + l2Size;
    int* res = (int*)malloc((*returnSize) * sizeof(int));
    int i = 0, j = 0, k = 0;
    while (i < l1Size && j < l2Size) {
        if (l1[i] <= l2[j]) res[k++] = l1[i++];
        else res[k++] = l2[j++];
    }
    while (i < l1Size) res[k++] = l1[i++];
    while (j < l2Size) res[k++] = l2[j++];
    return res;
}`,
            testCases: [
                { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', expected: '[1, 1, 2, 3, 4, 4]', run: (fn) => fn([1, 2, 4], [1, 3, 4]) },
                { input: 'list1 = [], list2 = []', expected: '[]', run: (fn) => fn([], []) },
                { input: 'list1 = [], list2 = [0]', expected: '[0]', run: (fn) => fn([], [0]) }
            ]
        },
        {
            id: 'max-subarray',
            number: 53,
            title: "Maximum Subarray (Kadane's)",
            difficulty: 'Medium',
            acceptance: '51.3%',
            tags: ['LeetCode #53', 'Arrays', 'Dynamic Programming'],
            description: `Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em>.`,
            examples: [
                { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.' },
                { input: 'nums = [1]', output: '1', explanation: 'Single element array.' },
                { input: 'nums = [5, 4, -1, 7, 8]', output: '23', explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.' }
            ],
            constraints: [
                '1 <= nums.length <= 10^5',
                '-10^4 <= nums[i] <= 10^4'
            ],
            hint: "Kadane's Algorithm: Maintain currentMax = max(nums[i], currentMax + nums[i]), and update maxSoFar.",
            jsStarter: `/**
 * LeetCode #53: Maximum Subarray
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let currentMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentMax = Math.max(nums[i], currentMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currentMax);
    }
    return maxSoFar;
}`,
            pyStarter: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur_max = max_so_far = nums[0]
        for x in nums[1:]:
            cur_max = max(x, cur_max + x)
            max_so_far = max(max_so_far, cur_max)
        return max_so_far`,
            javaStarter: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentMax = Math.max(nums[i], currentMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }
}`,
            cppStarter: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSoFar = nums[0], currentMax = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            currentMax = max(nums[i], currentMax + nums[i]);
            maxSoFar = max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }
};`,
            cStarter: `int maxSubArray(int* nums, int numsSize) {
    int maxSoFar = nums[0];
    int currentMax = nums[0];
    for (int i = 1; i < numsSize; i++) {
        currentMax = nums[i] > (currentMax + nums[i]) ? nums[i] : (currentMax + nums[i]);
        if (currentMax > maxSoFar) maxSoFar = currentMax;
    }
    return maxSoFar;
}`,
            testCases: [
                { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6', run: (fn) => fn([-2, 1, -3, 4, -1, 2, 1, -5, 4]) },
                { input: 'nums = [1]', expected: '1', run: (fn) => fn([1]) },
                { input: 'nums = [5, 4, -1, 7, 8]', expected: '23', run: (fn) => fn([5, 4, -1, 7, 8]) }
            ]
        },
        {
            id: 'best-time-stock',
            number: 121,
            title: 'Best Time to Buy and Sell Stock',
            difficulty: 'Easy',
            acceptance: '54.5%',
            tags: ['LeetCode #121', 'Arrays', 'Two Pointers'],
            description: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i-th</code> day.<br><br>Return <em>the maximum profit you can achieve</em> by choosing a day to buy and a later day to sell. If no profit can be achieved, return <code>0</code>.`,
            examples: [
                { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.' },
                { input: 'prices = [7, 6, 4, 3, 1]', output: '0', explanation: 'No transactions are done and max profit = 0.' }
            ],
            constraints: [
                '1 <= prices.length <= 10^5',
                '0 <= prices[i] <= 10^4'
            ],
            hint: 'Keep track of minPrice seen so far. At each day, calculate profit = price - minPrice.',
            jsStarter: `/**
 * LeetCode #121: Best Time to Buy and Sell Stock
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let price of prices) {
        if (price < minPrice) minPrice = price;
        else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
    }
    return maxProfit;
}`,
            pyStarter: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_p = float('inf')
        profit = 0
        for p in prices:
            min_p = min(min_p, p)
            profit = max(profit, p - min_p)
        return profit`,
            javaStarter: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        return maxProfit;
    }
}`,
            cppStarter: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else maxProfit = max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
};`,
            cStarter: `int maxProfit(int* prices, int pricesSize) {
    int minPrice = 2147483647;
    int maxProfit = 0;
    for (int i = 0; i < pricesSize; i++) {
        if (prices[i] < minPrice) minPrice = prices[i];
        else if (prices[i] - minPrice > maxProfit) maxProfit = prices[i] - minPrice;
    }
    return maxProfit;
}`,
            testCases: [
                { input: 'prices = [7, 1, 5, 3, 6, 4]', expected: '5', run: (fn) => fn([7, 1, 5, 3, 6, 4]) },
                { input: 'prices = [7, 6, 4, 3, 1]', expected: '0', run: (fn) => fn([7, 6, 4, 3, 1]) },
                { input: 'prices = [2, 4, 1]', expected: '2', run: (fn) => fn([2, 4, 1]) }
            ]
        },
        {
            id: 'climbing-stairs',
            number: 70,
            title: 'Climbing Stairs',
            difficulty: 'Easy',
            acceptance: '52.7%',
            tags: ['LeetCode #70', 'Dynamic Programming', 'Memoization'],
            description: `You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?`,
            examples: [
                { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\\n2. 2 steps' },
                { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\\n2. 1 step + 2 steps\\n3. 2 steps + 1 step' }
            ],
            constraints: [
                '1 <= n <= 45'
            ],
            hint: 'ways(n) = ways(n-1) + ways(n-2). This is equivalent to the Fibonacci sequence!',
            jsStarter: `/**
 * LeetCode #70: Climbing Stairs
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    if (n <= 2) return n;
    let prev2 = 1, prev1 = 2;
    for (let i = 3; i <= n; i++) {
        let curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
            pyStarter: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2: return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`,
            javaStarter: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
            cppStarter: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
};`,
            cStarter: `int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
            testCases: [
                { input: 'n = 2', expected: '2', run: (fn) => fn(2) },
                { input: 'n = 3', expected: '3', run: (fn) => fn(3) },
                { input: 'n = 4', expected: '5', run: (fn) => fn(4) }
            ]
        }
    ];

