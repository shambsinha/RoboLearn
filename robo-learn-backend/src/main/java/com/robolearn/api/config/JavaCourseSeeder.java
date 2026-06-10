package com.robolearn.api.config;

import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.entity.Course;
import com.robolearn.api.entity.Module;
import com.robolearn.api.entity.Module.CurriculumItem;
import com.robolearn.api.entity.TestCase;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.CourseRepository;
import com.robolearn.api.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JavaCourseSeeder {

    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    public void seedJavaCourse() {
        courseRepository.findByTitle("Java Mastery: Zero to Hero").ifPresent(course -> {
            courseRepository.delete(course);
            log.info("Deleted existing Java course to force re-seed.");
        });

        // WIPE ALL PROBLEMS FOR FRESH START
        problemRepository.deleteAll();
        testCaseRepository.deleteAll();
        log.info("Cleared all problems and test cases for fresh seeding.");

        log.info("Seeding comprehensive Java course with theory, videos, and high-quality DSA problems...");

        List<Long> problemIds = new ArrayList<>();

        // 1. Two Sum
        problemIds.add(seedTwoSum());

        // 2. Reverse String
        problemIds.add(seedReverseString());

        // 3. Valid Palindrome
        problemIds.add(seedValidPalindrome());

        // 4. Fibonacci Number
        problemIds.add(seedFibonacci());

        // 5. Contains Duplicate
        problemIds.add(seedContainsDuplicate());

        // Build the Course
        Course javaCourse = Course.builder()
                .courseId(UUID.randomUUID().toString())
                .title("Java Mastery: Zero to Hero")
                .description("A complete Java developer path combining theoretical foundations, practical applications, and top-tier Data Structures & Algorithms challenges to get you interview-ready.")
                .level("BEGINNER")
                .category("Programming")
                .imageUrl("https://images.unsplash.com/photo-1517694712202-14dd9538aa97")
                .problemIds(problemIds)
                .build();

        List<Module> modules = new ArrayList<>();

        // Module 1: Introduction
        Module m1 = Module.builder().moduleId(UUID.randomUUID().toString()).title("1. Introduction to Java").serialOrder(1).build();
        m1.getItems().add(new CurriculumItem(1, "THEORY", "<h1>Welcome to Java</h1><p>Java is a high-level, class-based, object-oriented programming language. It is a general-purpose programming language intended to let programmers write once, run anywhere (WORA).</p>", "What is Java?"));
        m1.getItems().add(new CurriculumItem(2, "VIDEO", "https://www.youtube.com/watch?v=eIrMbAQSU34", "Java Tutorial for Beginners"));
        modules.add(m1);

        // Module 2: Arrays and Hashing
        Module m2 = Module.builder().moduleId(UUID.randomUUID().toString()).title("2. Mastering Arrays & Hashing").serialOrder(2).build();
        m2.getItems().add(new CurriculumItem(1, "PROBLEM", String.valueOf(problemIds.get(0)), "DSA: Two Sum"));
        m2.getItems().add(new CurriculumItem(2, "PROBLEM", String.valueOf(problemIds.get(4)), "DSA: Contains Duplicate"));
        modules.add(m2);

        // Module 3: Strings & Two Pointers
        Module m3 = Module.builder().moduleId(UUID.randomUUID().toString()).title("3. Strings & Two Pointers").serialOrder(3).build();
        m3.getItems().add(new CurriculumItem(1, "PROBLEM", String.valueOf(problemIds.get(1)), "DSA: Reverse String"));
        m3.getItems().add(new CurriculumItem(2, "PROBLEM", String.valueOf(problemIds.get(2)), "DSA: Valid Palindrome"));
        modules.add(m3);

        // Module 4: Recursion & DP
        Module m4 = Module.builder().moduleId(UUID.randomUUID().toString()).title("4. Recursion & Dynamic Programming").serialOrder(4).build();
        m4.getItems().add(new CurriculumItem(1, "PROBLEM", String.valueOf(problemIds.get(3)), "DSA: Fibonacci Number"));
        modules.add(m4);

        javaCourse.setModules(modules);
        courseRepository.save(javaCourse);

        log.info("Java Course successfully seeded!");
    }

    private Long seedTwoSum() {
        String driver = "import java.util.*;\n" +
                "public class Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        if(!sc.hasNextLine()) return;\n" +
                "        String s = sc.nextLine().trim();\n" +
                "        s = s.substring(1, s.length() - 1);\n" +
                "        String[] p = s.split(\",\");\n" +
                "        int[] arr = new int[p.length];\n" +
                "        for(int i=0; i<p.length; i++) arr[i] = Integer.parseInt(p[i].trim());\n" +
                "        int target = Integer.parseInt(sc.nextLine().trim());\n" +
                "        Solution sol = new Solution();\n" +
                "        int[] res = sol.twoSum(arr, target);\n" +
                "        if(res == null || res.length != 2) {\n" +
                "            System.out.print(\"[]\");\n" +
                "        } else {\n" +
                "            Arrays.sort(res);\n" +
                "            System.out.print(\"[\" + res[0] + \",\" + res[1] + \"]\");\n" +
                "        }\n" +
                "    }\n" +
                "}";
        
        String boilerplate = "class Solution {\n" +
                "    public int[] twoSum(int[] nums, int target) {\n" +
                "        // Write your solution here\n" +
                "        return new int[]{};\n" +
                "    }\n" +
                "}";

        Long id = 1L;
        createProblem(id, "Two Sum", 
            "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.", 
            "EASY", Arrays.asList("Array", "Hash Table"), boilerplate, driver);

        addTC(id, "[2,7,11,15]\n9", "[0,1]", false);
        addTC(id, "[3,2,4]\n6", "[1,2]", false);
        addTC(id, "[3,3]\n6", "[0,1]", false);
        addTC(id, "[1,5,8,3]\n11", "[2,3]", true);
        addTC(id, "[0,4,3,0]\n0", "[0,3]", true);
        addTC(id, "[-1,-2,-3,-4,-5]\n-8", "[2,4]", true);
        addTC(id, "[10,20,30,40,50,60,70,80,90,100]\n190", "[8,9]", true);
        addTC(id, "[1,2,3,4,5,6,7,8,9,10]\n19", "[8,9]", true);
        addTC(id, "[100,200,300,400]\n500", "[1,2]", true);
        addTC(id, "[5,10,15,20,25]\n45", "[3,4]", true);
        
        return id;
    }

    private Long seedReverseString() {
        String driver = "import java.util.*;\n" +
                "public class Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        if(!sc.hasNextLine()) return;\n" +
                "        String s = sc.nextLine().trim();\n" +
                "        s = s.substring(1, s.length() - 1);\n" +
                "        String[] p = s.split(\",\");\n" +
                "        char[] arr = new char[p.length];\n" +
                "        for(int i=0; i<p.length; i++) {\n" +
                "            String val = p[i].trim();\n" +
                "            if(val.startsWith(\"\\\"\")) val = val.substring(1, val.length()-1);\n" +
                "            arr[i] = val.charAt(0);\n" +
                "        }\n" +
                "        Solution sol = new Solution();\n" +
                "        sol.reverseString(arr);\n" +
                "        System.out.print(\"[\");\n" +
                "        for(int i=0; i<arr.length; i++) {\n" +
                "            System.out.print(\"\\\"\" + arr[i] + \"\\\"\");\n" +
                "            if(i < arr.length - 1) System.out.print(\",\");\n" +
                "        }\n" +
                "        System.out.print(\"]\");\n" +
                "    }\n" +
                "}";
        
        String boilerplate = "class Solution {\n" +
                "    public void reverseString(char[] s) {\n" +
                "        // Write your solution here\n" +
                "    }\n" +
                "}";

        Long id = 2L;
        createProblem(id, "Reverse String", 
            "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.", 
            "EASY", Arrays.asList("String", "Two Pointers"), boilerplate, driver);

        addTC(id, "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "[\"o\",\"l\",\"l\",\"e\",\"h\"]", false);
        addTC(id, "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", false);
        addTC(id, "[\"a\"]", "[\"a\"]", true);
        addTC(id, "[\"a\",\"b\"]", "[\"b\",\"a\"]", true);
        addTC(id, "[\"R\",\"o\",\"b\",\"o\",\"L\",\"e\",\"a\",\"r\",\"n\"]", "[\"n\",\"r\",\"a\",\"e\",\"L\",\"o\",\"b\",\"o\",\"R\"]", true);
        addTC(id, "[\"1\",\"2\",\"3\",\"4\",\"5\"]", "[\"5\",\"4\",\"3\",\"2\",\"1\"]", true);
        addTC(id, "[\" \",\"!\",\"@\"]", "[\"@\",\"!\",\" \"]", true);
        addTC(id, "[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\"]", "[\"G\",\"F\",\"E\",\"D\",\"C\",\"B\",\"A\"]", true);
        addTC(id, "[\"z\",\"y\",\"x\",\"w\"]", "[\"w\",\"x\",\"y\",\"z\"]", true);
        addTC(id, "[\"m\",\"o\",\"m\"]", "[\"m\",\"o\",\"m\"]", true);

        return id;
    }

    private Long seedValidPalindrome() {
        String driver = "import java.util.*;\n" +
                "public class Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        if(!sc.hasNextLine()) return;\n" +
                "        String s = sc.nextLine().trim();\n" +
                "        if(s.startsWith(\"\\\"\")) s = s.substring(1, s.length() - 1);\n" +
                "        Solution sol = new Solution();\n" +
                "        System.out.print(sol.isPalindrome(s));\n" +
                "    }\n" +
                "}";
        
        String boilerplate = "class Solution {\n" +
                "    public boolean isPalindrome(String s) {\n" +
                "        // Write your solution here\n" +
                "        return false;\n" +
                "    }\n" +
                "}";

        Long id = 3L;
        createProblem(id, "Valid Palindrome", 
            "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.", 
            "EASY", Arrays.asList("String", "Two Pointers"), boilerplate, driver);

        addTC(id, "\"A man, a plan, a canal: Panama\"", "true", false);
        addTC(id, "\"race a car\"", "false", false);
        addTC(id, "\" \"", "true", false);
        addTC(id, "\"ab_a\"", "true", true);
        addTC(id, "\"0P\"", "false", true);
        addTC(id, "\"121\"", "true", true);
        addTC(id, "\"No 'x' in Nixon\"", "true", true);
        addTC(id, "\"Was it a car or a cat I saw?\"", "true", true);
        addTC(id, "\"Madam, I'm Adam\"", "true", true);
        addTC(id, "\"Step on no pets\"", "true", true);

        return id;
    }

    private Long seedFibonacci() {
        String driver = "import java.util.*;\n" +
                "public class Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        if(!sc.hasNextInt()) return;\n" +
                "        int n = sc.nextInt();\n" +
                "        Solution sol = new Solution();\n" +
                "        System.out.print(sol.fib(n));\n" +
                "    }\n" +
                "}";
        
        String boilerplate = "class Solution {\n" +
                "    public int fib(int n) {\n" +
                "        // Write your solution here\n" +
                "        return 0;\n" +
                "    }\n" +
                "}";

        Long id = 4L;
        createProblem(id, "Fibonacci Number", 
            "The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. `F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2), for n > 1`.", 
            "EASY", Arrays.asList("Math", "Recursion", "Dynamic Programming"), boilerplate, driver);

        addTC(id, "2", "1", false);
        addTC(id, "3", "2", false);
        addTC(id, "4", "3", false);
        addTC(id, "0", "0", true);
        addTC(id, "1", "1", true);
        addTC(id, "5", "5", true);
        addTC(id, "10", "55", true);
        addTC(id, "20", "6765", true);
        addTC(id, "30", "832040", true);
        addTC(id, "15", "610", true);

        return id;
    }

    private Long seedContainsDuplicate() {
        String driver = "import java.util.*;\n" +
                "public class Main {\n" +
                "    public static void main(String[] args) {\n" +
                "        Scanner sc = new Scanner(System.in);\n" +
                "        if(!sc.hasNextLine()) return;\n" +
                "        String s = sc.nextLine().trim();\n" +
                "        s = s.substring(1, s.length() - 1);\n" +
                "        String[] parts = s.split(\",\");\n" +
                "        int[] nums;\n" +
                "        if(s.isEmpty()) nums = new int[0];\n" +
                "        else {\n" +
                "            nums = new int[parts.length];\n" +
                "            for(int i=0; i<parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());\n" +
                "        }\n" +
                "        Solution sol = new Solution();\n" +
                "        System.out.print(sol.containsDuplicate(nums));\n" +
                "    }\n" +
                "}";
        
        String boilerplate = "class Solution {\n" +
                "    public boolean containsDuplicate(int[] nums) {\n" +
                "        // Write your solution here\n" +
                "        return false;\n" +
                "    }\n" +
                "}";

        Long id = 5L;
        createProblem(id, "Contains Duplicate", 
            "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.", 
            "EASY", Arrays.asList("Array", "Hash Table"), boilerplate, driver);

        addTC(id, "[1,2,3,1]", "true", false);
        addTC(id, "[1,2,3,4]", "false", false);
        addTC(id, "[1,1,1,3,3,4,3,2,4,2]", "true", false);
        addTC(id, "[]", "false", true);
        addTC(id, "[1]", "false", true);
        addTC(id, "[10,20,30,40,50,60,70,80,90,100,10]", "true", true);
        addTC(id, "[-1,-2,-1]", "true", true);
        addTC(id, "[1000,2000,3000]", "false", true);
        addTC(id, "[0,0]", "true", true);
        addTC(id, "[1,2,3,4,5,6,7,8,9,0]", "false", true);

        return id;
    }

    private void createProblem(Long id, String title, String desc, String diff, List<String> tags, String boilerplate, String driver) {
        CodingProblem problem = CodingProblem.builder()
                .id(id)
                .title(title)
                .description(desc)
                .difficulty(diff)
                .tags(tags)
                .boilerplateCode(boilerplate)
                .driverCode(driver)
                .testCaseIds(new ArrayList<>())
                .build();
        problemRepository.save(problem);
    }

    private void addTC(Long problemId, String input, String output, boolean isHidden) {
        CodingProblem problem = problemRepository.findById(problemId).orElseThrow();
        
        TestCase tc = TestCase.builder()
                .id(System.nanoTime()) // use nanoTime for uniqueness in seeding
                .input(input)
                .expectedOutput(output)
                .isHidden(isHidden)
                .problemId(problemId)
                .build();
        testCaseRepository.save(tc);
        
        problem.getTestCaseIds().add(tc.getId());
        problemRepository.save(problem);
    }
}